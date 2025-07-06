"use server";

import { createClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/utils/encoded-redirect";
import { Provider } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(email: string, password: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect("error", "/register", "Email and password are required");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/callback`
    }
  });

  if (authError) {
    console.error(authError.code + " " + authError.message);
    return encodedRedirect("error", "/register", authError.message);
  }

  if (!authData.user) {
    return encodedRedirect("error", "/register", "User creation failed");
  }

  return encodedRedirect(
    "success",
    "/register",
    "Thanks for signing up! Please check your email for a verification link."
  );
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
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
      return encodedRedirect("error", "/login", insertError.message);
    }
  }

  if (userError) {
    return encodedRedirect("error", "/login", userError.message);
  }

  return redirect("/gallery");
}

export async function signInWithOAuthAction(provider: Provider) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/callback`
    }
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  return redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return redirect("/login");
}
