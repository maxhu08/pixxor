"use client";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginAction, registerAction, signInWithOAuthAction } from "@/lib/actions/account-actions";
import { Provider } from "@supabase/supabase-js";
import { Eye, EyeOff, Lock, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";

export function AuthCard() {
  return (
    <Suspense fallback={<Card className="p-6">Loading...</Card>}>
      <AuthCardContent />
    </Suspense>
  );
}

function SocialLogins() {
  const [_, startTransition] = useTransition();

  function handleOAuthLogin(provider: Provider) {
    startTransition(() => {
      signInWithOAuthAction(provider);
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        onClick={() => handleOAuthLogin("google")}
        className="flex w-full cursor-pointer items-center justify-start gap-2 border border-gray-300 bg-white px-4 text-gray-700 transition-colors duration-300 hover:bg-gray-300"
      >
        <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path
            fill="#4285F4"
            d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
          />
          <path
            fill="#FBBC05"
            d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
          />
          <path
            fill="#EA4335"
            d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
          />
          <path fill="none" d="M2 2h44v44H2z" />
        </svg>
        Continue with Google
      </Button>
      <Button
        onClick={() => handleOAuthLogin("github")}
        className="flex w-full cursor-pointer items-center justify-start gap-2 bg-black px-4 text-white transition-colors duration-300 hover:bg-black"
      >
        <svg className="size-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
        </svg>
        Continue with GitHub
      </Button>
    </div>
  );
}

function AuthCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error") ?? "";
  const success = searchParams.get("success") ?? "";

  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, []);

  function handleTabChange(value: string) {
    setActiveTab(value);
    router.replace(`/${value}`);
  }

  return (
    <>
      {success ? (
        <Card className="w-max p-6">
          <div className="flex flex-col items-center p-6">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <MailCheck />
              Check your email
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              We&apos;ve sent a confirmation link to <span className="font-medium">{email}</span>
              .<br />
              Please check your inbox to complete your registration.
            </p>
          </div>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className={activeTab !== "login" ? "cursor-pointer" : ""}>
              Log in
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className={activeTab !== "register" ? "cursor-pointer" : ""}
            >
              Sign up
            </TabsTrigger>
          </TabsList>
          <Card className="gap-4 p-6">
            <TabsContent value="login">
              <form className="flex min-w-64 flex-1 flex-col gap-4">
                <div className="mb-1 flex flex-col gap-px">
                  <h1 className="text-2xl font-medium">Sign in</h1>
                  <p className="text-sm">Welcome back! Enter your credentials to continue.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="text-muted-foreground absolute flex size-9 items-center justify-center">
                      <Mail className="size-4" />
                    </div>
                    <Input
                      className="pl-9"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link className="text-foreground text-xs underline" href="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <div className="text-muted-foreground absolute flex size-9 items-center justify-center">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      className="pl-9"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground absolute right-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
                <SubmitButton
                  pendingText="Signing in..."
                  formAction={loginAction}
                  disabled={email.trim() === "" || password.trim() === ""}
                >
                  Sign in
                </SubmitButton>
                {error && (
                  <div className="rounded-md border border-red-500 bg-red-500/20 p-3 text-sm text-red-500">
                    {decodeURIComponent(error)}
                  </div>
                )}
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form className="flex min-w-64 flex-1 flex-col gap-4">
                <div className="mb-1 flex flex-col gap-px">
                  <h1 className="text-2xl font-medium">Create an account</h1>
                  <p className="text-sm">Sign up to unlock all features and start journaling.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="text-muted-foreground absolute flex size-9 items-center justify-center">
                      <Mail className="size-4" />
                    </div>
                    <Input
                      className="pl-9"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative flex items-center">
                    <div className="text-muted-foreground absolute flex size-9 items-center justify-center">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      className="pl-9"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground absolute right-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative flex items-center">
                    <div className="text-muted-foreground absolute flex size-9 items-center justify-center">
                      <Lock className="size-4" />
                    </div>
                    <Input
                      className="pl-9"
                      type={showPassword ? "text" : "password"}
                      name="confirm-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground absolute right-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
                <SubmitButton
                  pendingText="Signing up..."
                  onClick={async (e) => {
                    e.preventDefault();
                    await registerAction(email, password);
                  }}
                  disabled={
                    email.trim() === "" || password.trim() === "" || password !== confirmPassword
                  }
                >
                  Sign up
                </SubmitButton>
                {error && (
                  <div className="rounded-md border border-red-500 bg-red-500/20 p-3 text-sm text-red-500">
                    {decodeURIComponent(error)}
                  </div>
                )}
              </form>
            </TabsContent>
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm whitespace-nowrap">or</span>
              <Separator className="flex-1" />
            </div>
            <SocialLogins />
          </Card>
        </Tabs>
      )}
    </>
  );
}
