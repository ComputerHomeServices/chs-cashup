import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Handle browser security handshake (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, userId, newPassword, email, password, firstName, lastName, role } = await req.json();
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ACTION: Create a new user with AUTO-CONFIRMATION
    if (action === 'create-user') {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName, role: role || 'user' }
      });

      if (createError) throw createError;

      // Sync the profiles table
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: newUser.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role || 'user',
          email: email
        });

      if (profileError) console.error("Profile sync warning:", profileError);
    } 
    
    // ACTION: Force reset a password
    else if (action === 'reset-password') {
      const { error: resetError } = await adminClient.auth.admin.updateUserById(userId, { 
        password: newPassword 
      });
      if (resetError) throw resetError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
