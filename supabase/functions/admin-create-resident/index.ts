import { createClient } from "jsr:@supabase/supabase-js@2";

// Creates a real, login-capable account (resident, staff, or admin-assigned
// staff position like Kagawad). Staff/admin only.
// Runs with the service role key server-side — this privilege never reaches the browser.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Scoped to the calling user's own JWT, purely to check their role.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
  }

  const { data: callerProfile } = await callerClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || !["staff", "admin"].includes(callerProfile.role)) {
    return new Response(JSON.stringify({ error: "Forbidden — staff or admin only" }), { status: 403 });
  }

  const body = await req.json();
  const {
    email,
    full_name,
    mobile_number,
    house_lot_no,
    street,
    purok_zone,
    household_no,
    role,
    position,
  } = body;

  if (!email || !full_name) {
    return new Response(JSON.stringify({ error: "email and full_name are required" }), { status: 400 });
  }

  const requestedRole = role === "staff" ? "staff" : "resident";
  // Only staff/admin may create staff-role accounts — residents can't self-elevate
  // via this endpoint since the caller check above already restricts who can call it,
  // but this keeps the intent explicit.

  // Elevated client — only ever used server-side, never exposed to callers.
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const tempPassword = crypto.randomUUID();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createError || !created.user) {
    return new Response(
      JSON.stringify({ error: createError?.message ?? "Failed to create user" }),
      { status: 400 }
    );
  }

  // handle_new_user already inserted a bare profile row (role defaults to 'resident').
  // Fill in the rest of what staff entered on the Add User/Add Resident form.
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      mobile_number,
      house_lot_no,
      street,
      purok_zone,
      household_no,
      role: requestedRole,
      position: position || null,
    })
    .eq("id", created.user.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
  }

  return new Response(
    JSON.stringify({ user_id: created.user.id, temp_password: tempPassword }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
