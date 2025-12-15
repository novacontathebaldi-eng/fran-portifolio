import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ClaimRequest {
    code: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!serviceRoleKey) {
            console.error("[claim-invite] SUPABASE_SERVICE_ROLE_KEY not configured!");
            return new Response(
                JSON.stringify({ success: false, error: "Server configuration error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create admin client with service role key
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Parse request body
        const body: ClaimRequest = await req.json();
        const { code, email, password, name, phone } = body;

        // Validate required fields
        if (!code || !email || !password) {
            return new Response(
                JSON.stringify({ success: false, error: "Código, email e senha são obrigatórios" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return new Response(
                JSON.stringify({ success: false, error: "A senha deve ter no mínimo 6 caracteres" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[claim-invite] Processing claim for code: ${code}`);

        // 1. Validate invite code exists and is pending
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from("client_invites")
            .select("*")
            .eq("code", code.toUpperCase())
            .single();

        if (inviteError || !invite) {
            console.log(`[claim-invite] Invalid code: ${code}`);
            return new Response(
                JSON.stringify({ success: false, error: "Código inválido ou não encontrado" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (invite.status !== "pending") {
            console.log(`[claim-invite] Code already claimed: ${code}`);
            return new Response(
                JSON.stringify({ success: false, error: "Este convite já foi utilizado" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if invite is expired
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            console.log(`[claim-invite] Code expired: ${code}`);
            return new Response(
                JSON.stringify({ success: false, error: "Este convite expirou" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Check if email already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const emailExists = existingUsers?.users?.some(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            console.log(`[claim-invite] Email already exists: ${email}`);
            return new Response(
                JSON.stringify({ success: false, error: "Este email já está cadastrado. Faça login." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[claim-invite] Creating user: ${email}`);

        // 3. Create user via Admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name: name || invite.internal_name || email.split("@")[0],
                phone: phone || null,
            },
        });

        if (createError || !newUser.user) {
            console.error(`[claim-invite] Failed to create user:`, createError);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: createError?.message || "Erro ao criar usuário"
                }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const userId = newUser.user.id;
        console.log(`[claim-invite] User created: ${userId}`);

        // 4. Update profile with phone (trigger already creates profile)
        if (phone) {
            await supabaseAdmin
                .from("profiles")
                .update({ phone: phone })
                .eq("id", userId);
        }

        // 5. Transfer assets from invite to user
        console.log(`[claim-invite] Transferring assets from invite ${invite.id} to user ${userId}`);

        const { error: transferError } = await supabaseAdmin.rpc("transfer_invite_assets", {
            p_invite_id: invite.id,
            p_user_id: userId,
        });

        if (transferError) {
            console.error(`[claim-invite] Asset transfer failed:`, transferError);
            // Don't fail the whole request, user was created
        }

        // 6. Generate session for the new user
        console.log(`[claim-invite] Generating session for user`);

        // We need to sign in the user to get a session
        // Using password-based sign in since we just created it
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseClient = createClient(supabaseUrl, anonKey);

        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (signInError) {
            console.error(`[claim-invite] Sign in failed:`, signInError);
            // User was created but couldn't sign in - they can do it manually
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Conta criada! Faça login para acessar.",
                    user: { id: userId, email: email },
                    session: null,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[claim-invite] SUCCESS! User ${email} claimed invite ${code}`);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Conta criada com sucesso!",
                user: signInData.user,
                session: signInData.session,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("[claim-invite] Unexpected error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Erro inesperado. Tente novamente."
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
