import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return redirect("/login");
  }

  return children;
}
