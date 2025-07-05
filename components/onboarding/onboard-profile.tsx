import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getUserOrThrow } from "@/utils/get-user-or-throw";
import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export function OnboardProfile({ onSuccess }: { onSuccess: () => void }) {
  const supabase = createClient();

  const [hasProfileWithUsername, setHasProfileWithUsername] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setHasProfileWithUsername(null);
    (async () => {
      const user = await getUserOrThrow(supabase);
      if (!user) {
        setHasProfileWithUsername(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      setHasProfileWithUsername(!!profile?.name);
    })();
  }, [supabase]);

  function isUsernameValid(name: string) {
    return /^[a-zA-Z0-9._-]{3,32}$/.test(name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (hasProfileWithUsername) {
      onSuccess();
      return;
    }

    if (!username || !isUsernameValid(username)) return;

    startTransition(async () => {
      const user = await getUserOrThrow(supabase);
      if (!user) return;

      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);
        return;
      }

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ username })
          .eq("id", user.id);

        if (updateError) {
          console.error(updateError);
          return;
        }
      } else {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          username,
          name: user.user_metadata?.name || username,
          avatar_url: user.user_metadata?.avatar_url
        });

        if (insertError) {
          console.error(insertError);
          return;
        }
      }

      onSuccess();
    });
  }

  if (hasProfileWithUsername === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="bg-card flex flex-col items-center space-y-4 rounded-lg px-8 py-12 shadow-md">
          <LoaderCircle className="text-muted-foreground size-8 animate-spin" />
          <h2 className="text-muted-foreground text-lg font-medium">Checking your profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full w-full flex-col justify-center text-center"
    >
      {hasProfileWithUsername ? (
        <div className="bg-card flex flex-col items-center space-y-4 rounded-lg px-8 py-12">
          <Check className="size-8 text-green-500" />
          <h2 className="text-xl font-semibold">You already have a profile, great!</h2>
          <p className="text-muted-foreground">You're all set to continue.</p>
        </div>
      ) : (
        <div className="flex grow flex-col items-center justify-center space-y-4 px-8">
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-medium">Set up your profile</h2>
            <p className="text-muted-foreground">Choose a username. You can change this later.</p>
          </div>
          <div className="mx-auto mt-6 w-full max-w-xs">
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
                className={`${
                  username && isUsernameValid(username)
                    ? "not-focus-visible:border-green-500 focus-visible:ring-green-500"
                    : username && !isUsernameValid(username)
                      ? "not-focus-visible:border-red-500 focus-visible:ring-red-500"
                      : ""
                }`}
              />
            </div>
            <div className="mt-1 text-left text-xs text-red-500">
              {!username && <p>Please pick a username</p>}
              {username && !isUsernameValid(username) && (
                <>
                  {(username.length < 3 || username.length > 32) && (
                    <p>Username must be 3-32 characters</p>
                  )}
                  {!/^[a-zA-Z0-9._-]*$/.test(username) && (
                    <p>
                      Username can only contain letters, numbers, underscores, periods, and hyphens
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            !hasProfileWithUsername && (!username || !isUsernameValid(username) || isPending)
          }
          className="cursor-pointer"
        >
          {isPending ? "Saving..." : "Next"}
        </Button>
      </div>
    </form>
  );
}
