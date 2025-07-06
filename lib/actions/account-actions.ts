"use server";

import { createClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/utils/encoded-redirect";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return encodedRedirect("error", "/auth/login", error.message);
  }

  const { user } = authData;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (userError && userError.code === "PGRST116") {
    // user might not exist yet since they are only in auth.users -> create new user
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      name: user.user_metadata.full_name || user.email,
      avatar_url: user.user_metadata.avatar_url || null
    });

    if (insertError) {
      return encodedRedirect("error", "/auth/login", insertError.message);
    }
  }

  if (userError) {
    return encodedRedirect("error", "/auth/login", userError.message);
  }

  return redirect("/gallery");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return redirect("/auth/login");
}
