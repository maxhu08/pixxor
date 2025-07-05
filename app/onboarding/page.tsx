import { OnboardingPage } from "@/components/onboarding/onboarding-page";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow } from "@/utils/get-user-or-throw";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const user = await getUserOrThrow(supabase);

  const { data: profile, error } = await supabase
    .from("users")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    redirect("/auth/login");
  }

  if (profile?.onboarded) {
    redirect("/dashboard");
  }

  return <OnboardingPage />;
}
