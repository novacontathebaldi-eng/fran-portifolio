import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to extract storage path from URL
function extractPathFromUrl(url: string): string | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // Format: /storage/v1/object/public/bucket-name/path/to/file
        const match = urlObj.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/[^\/]+\/(.+)/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify the calling user
        const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !callingUser) {
            return new Response(
                JSON.stringify({ error: "Invalid token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify the calling user is an admin
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", callingUser.id)
            .single();

        if (profileError || callerProfile?.role !== "admin") {
            return new Response(
                JSON.stringify({ error: "Unauthorized: Admin access required" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get the userId to delete from request body
        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "Missing userId parameter" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return new Response(
                JSON.stringify({ error: "Invalid userId format" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Prevent admin from deleting themselves
        if (userId === callingUser.id) {
            return new Response(
                JSON.stringify({ error: "Cannot delete your own account" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[delete-user] Starting deletion for user: ${userId}`);

        // ============================================
        // STEP 1: DELETE STORAGE FILES
        // ============================================

        // 1a. Get user's folders and files
        const { data: folders } = await supabaseAdmin
            .from("client_folders")
            .select("id")
            .eq("user_id", userId);

        const folderIds = folders?.map(f => f.id) || [];

        if (folderIds.length > 0) {
            const { data: files } = await supabaseAdmin
                .from("client_files")
                .select("url")
                .in("folder_id", folderIds);

            // Delete files from documents bucket
            for (const file of files || []) {
                const path = extractPathFromUrl(file.url);
                if (path) {
                    await supabaseAdmin.storage.from("documents").remove([path]);
                    console.log(`[delete-user] Deleted document: ${path}`);
                }
            }
        }

        // 1b. Delete avatar
        const { data: profileData } = await supabaseAdmin
            .from("profiles")
            .select("avatar_url")
            .eq("id", userId)
            .single();

        if (profileData?.avatar_url) {
            const avatarPath = extractPathFromUrl(profileData.avatar_url);
            if (avatarPath) {
                await supabaseAdmin.storage.from("avatars").remove([avatarPath]);
                console.log(`[delete-user] Deleted avatar: ${avatarPath}`);
            }
        }

        // 1c. Delete budget attachments from storage
        const { data: attachments } = await supabaseAdmin
            .from("budget_attachments")
            .select("file_url")
            .eq("uploaded_by", userId);

        for (const att of attachments || []) {
            const path = extractPathFromUrl(att.file_url);
            if (path) {
                await supabaseAdmin.storage.from("budget-attachments").remove([path]);
                console.log(`[delete-user] Deleted budget attachment: ${path}`);
            }
        }

        console.log(`[delete-user] Storage cleanup complete`);

        // ============================================
        // STEP 2 & 3: DELETE DATABASE RECORDS VIA RPC
        // ============================================

        const { error: rpcError } = await supabaseAdmin.rpc("delete_user_data", {
            target_user_id: userId
        });

        if (rpcError) {
            console.error(`[delete-user] RPC error:`, rpcError);
            throw new Error(`Failed to delete user data: ${rpcError.message}`);
        }

        console.log(`[delete-user] Database records deleted via RPC`);

        // ============================================
        // STEP 4: DELETE AUTH USER (triggers CASCADE)
        // ============================================

        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
            console.error(`[delete-user] Auth delete error:`, deleteAuthError);
            throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`);
        }

        console.log(`[delete-user] User ${userId} deleted successfully`);

        return new Response(
            JSON.stringify({ success: true, message: "User deleted successfully" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error(`[delete-user] Error:`, error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
