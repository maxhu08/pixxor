import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserOrThrow(supabase: SupabaseClient<any, "public", any>) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}
