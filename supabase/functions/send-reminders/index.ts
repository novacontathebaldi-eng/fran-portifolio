// supabase/functions/send-reminders/index.ts
// Edge Function para envio automático de lembretes de reunião

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationsConfig {
    whatsapp: {
        enabled: boolean;
        adminPhones: string[];
        reminders: {
            enabled: boolean;
            daysInAdvance: 1 | 2 | 3;
            client: { enabled: boolean; time: string };
            admin: { enabled: boolean; time: string };
        };
        templates: {
            reminderClient: string | null;
            reminderAdmin: string | null;
        };
    };
}

interface Appointment {
    id: string;
    client_id: string;
    client_name: string;
    type: string;
    date: string;
    time: string;
}

interface Profile {
    id: string;
    phone: string | null;
}

const DEFAULT_TEMPLATES = {
    reminderClient: (name: string, type: string, date: string, time: string) =>
        `📅 *Lembrete de ${type}*\n\nOlá ${name}!\n\nLembramos que você tem um(a) *${type}* agendado(a) para:\n\n📆 Data: ${date}\n⏰ Horário: ${time}\n\nEm caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.\n\n_Fran Siller Arquitetura_`,

    reminderAdmin: (name: string, type: string, date: string, time: string) =>
        `🔔 *Lembrete de ${type}*\n\nVocê tem um(a) ${type} agendado(a):\n\n👤 Cliente: ${name}\n📆 Data: ${date}\n⏰ Horário: ${time}`,
};

const processTemplate = (template: string, vars: Record<string, string>): string => {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
};

const sendWhatsAppMessage = async (
    supabase: ReturnType<typeof createClient>,
    phone: string,
    message: string
): Promise<boolean> => {
    try {
        const cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone || cleanPhone.length < 10) {
            console.log("[Reminder] Número inválido:", phone);
            return false;
        }

        // Use WuzAPI directly
        const wuzapiUrl = Deno.env.get("WUZAPI_URL");
        const wuzapiToken = Deno.env.get("WUZAPI_TOKEN");

        if (!wuzapiUrl || !wuzapiToken) {
            console.error("[Reminder] WuzAPI não configurado");
            return false;
        }

        const response = await fetch(`${wuzapiUrl}/chat/send/text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Token: wuzapiToken,
            },
            body: JSON.stringify({
                Phone: cleanPhone,
                Body: message,
            }),
        });

        if (!response.ok) {
            console.error("[Reminder] WuzAPI error:", await response.text());
            return false;
        }

        console.log(`[Reminder] ✅ Mensagem enviada para ${cleanPhone}`);
        return true;
    } catch (err) {
        console.error("[Reminder] Erro:", err);
        return false;
    }
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Parse request body
        const body = await req.json().catch(() => ({}));
        const targetType = body.target as "client" | "admin" | "both" | undefined;

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch notifications config
        const { data: settingsData, error: settingsError } = await supabase
            .from("site_settings")
            .select("settings")
            .eq("id", "00000000-0000-0000-0000-000000000001")
            .single();

        if (settingsError) {
            console.error("[Reminder] Erro ao buscar configurações:", settingsError);
            return new Response(
                JSON.stringify({ success: false, error: "Erro ao buscar configurações" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        const config: NotificationsConfig = settingsData?.settings?.notificationsConfig || {
            whatsapp: {
                enabled: true,
                adminPhones: ["352691214222"],
                reminders: {
                    enabled: true,
                    daysInAdvance: 1,
                    client: { enabled: true, time: "09:00" },
                    admin: { enabled: true, time: "08:00" },
                },
                templates: { reminderClient: null, reminderAdmin: null },
            },
        };

        // Check if reminders are enabled
        if (!config.whatsapp.enabled || !config.whatsapp.reminders.enabled) {
            return new Response(
                JSON.stringify({ success: true, message: "Lembretes desativados", sent: 0 }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Calculate target date
        const daysInAdvance = config.whatsapp.reminders.daysInAdvance;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysInAdvance);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        console.log(`[Reminder] Buscando agendamentos para ${targetDateStr} (${daysInAdvance} dia(s) à frente)`);

        // Fetch confirmed appointments for target date
        const { data: appointments, error: appointmentsError } = await supabase
            .from("appointments")
            .select("id, client_id, client_name, type, date, time")
            .eq("date", targetDateStr)
            .eq("status", "confirmed");

        if (appointmentsError) {
            console.error("[Reminder] Erro ao buscar agendamentos:", appointmentsError);
            return new Response(
                JSON.stringify({ success: false, error: "Erro ao buscar agendamentos" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
        }

        if (!appointments || appointments.length === 0) {
            return new Response(
                JSON.stringify({ success: true, message: "Nenhum agendamento encontrado", sent: 0 }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[Reminder] ${appointments.length} agendamento(s) encontrado(s)`);

        let clientSent = 0;
        let clientFailed = 0;
        let adminSent = 0;
        let adminFailed = 0;

        // Process each appointment
        for (const appointment of appointments as Appointment[]) {
            const typeLabel = appointment.type === "visit" ? "Visita Técnica" : "Reunião";
            const formattedDate = new Date(appointment.date + "T00:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });

            // Send to client
            if (
                config.whatsapp.reminders.client.enabled &&
                (targetType === "client" || targetType === "both" || !targetType)
            ) {
                // Fetch client phone
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("phone")
                    .eq("id", appointment.client_id)
                    .single();

                if (profile?.phone) {
                    const customTemplate = config.whatsapp.templates.reminderClient;
                    const message = customTemplate
                        ? processTemplate(customTemplate, {
                            nome: appointment.client_name,
                            tipo: typeLabel,
                            data: formattedDate,
                            hora: appointment.time,
                        })
                        : DEFAULT_TEMPLATES.reminderClient(
                            appointment.client_name,
                            typeLabel,
                            formattedDate,
                            appointment.time
                        );

                    const success = await sendWhatsAppMessage(supabase, profile.phone, message);
                    if (success) clientSent++;
                    else clientFailed++;
                }
            }

            // Send to admins
            if (
                config.whatsapp.reminders.admin.enabled &&
                (targetType === "admin" || targetType === "both" || !targetType)
            ) {
                const adminPhones = config.whatsapp.adminPhones || [];
                const customTemplate = config.whatsapp.templates.reminderAdmin;
                const message = customTemplate
                    ? processTemplate(customTemplate, {
                        nome: appointment.client_name,
                        tipo: typeLabel,
                        data: formattedDate,
                        hora: appointment.time,
                    })
                    : DEFAULT_TEMPLATES.reminderAdmin(
                        appointment.client_name,
                        typeLabel,
                        formattedDate,
                        appointment.time
                    );

                for (const phone of adminPhones) {
                    const success = await sendWhatsAppMessage(supabase, phone, message);
                    if (success) adminSent++;
                    else adminFailed++;
                }
            }
        }

        const result = {
            success: true,
            targetDate: targetDateStr,
            appointments: appointments.length,
            client: { sent: clientSent, failed: clientFailed },
            admin: { sent: adminSent, failed: adminFailed },
            totalSent: clientSent + adminSent,
        };

        console.log("[Reminder] Resultado:", result);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("[Reminder] Erro geral:", error);
        return new Response(
            JSON.stringify({ success: false, error: String(error) }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
