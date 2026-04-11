import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // 1. Check if the requester is an ADMIN
    const { data: { user } } = await supabaseClient.auth.getUser();
    const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
    if (!isAdmin) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const { action, userId, newPassword, email, password, firstName, lastName, role } = await req.json();
    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === 'reset-password') {
      const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === 'create-user') {
      // Create user with AUTO-CONFIRMATION
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName, role: role || 'user' }
      });

      if (createError) throw createError;

      // Ensure a profile is created as well
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: newUser.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role || 'user',
          email: email
        });

      if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw here as the user is already created, but log it
      }

      return new Response(JSON.stringify({ success: true, user: newUser.user }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response("Invalid action", { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
})
