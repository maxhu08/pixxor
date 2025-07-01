import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!verifyError) {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userData?.user && !userError) {
        const { id, user_metadata } = userData.user;
        const name = user_metadata?.full_name || user_metadata?.name || "";
        const avatar_url = user_metadata?.avatar_url || null;

        await supabase
          .from("users")
          .insert({
            id,
            name,
            avatar_url,
          })

        redirect(next);
      } else {
        redirect(`/auth/error?error=Unable to fetch user`);
      }
    } else {
      redirect(`/auth/error?error=${verifyError.message}`);
    }
  }

  redirect(`/auth/error?error=No token hash or type`);
}

