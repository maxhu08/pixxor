import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, BookOpen, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = !!user;

  return (
    <div className="bg-background min-h-screen">
      <main id="main-content" className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              ✨ Capture and create memories
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Your creative space for
              <br />
              <span className="text-muted-foreground">
                photo albums and effects
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
              Organize your photos, add stunning effects, and share your stories
              with beautifully crafted albums.
            </p>
          </div>
          <div className="flex flex-col place-items-center justify-center gap-4 sm:flex-row">
            <Link href={signedIn ? "/dashboard" : "/auth/login"}>
              <Button
                size="lg"
                className="group cursor-pointer text-lg has-[>svg]:px-8"
              >
                {signedIn ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="size-5 transform transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Free & private • Your photos, your style
          </p>
        </div>
        <div className="mx-auto mt-24 grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-lg">
                <BookOpen className="text-primary size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Create Albums</h3>
              <p className="text-muted-foreground text-sm">
                Group your photos into personalized albums to keep your memories
                organized and easy to find.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-lg">
                <TrendingUp className="text-primary size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Add Stunning Effects
              </h3>
              <p className="text-muted-foreground text-sm">
                Enhance your photos with filters, overlays, and adjustments that
                bring your vision to life.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-primary/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-lg">
                <Heart className="text-primary size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Share & Enjoy</h3>
              <p className="text-muted-foreground text-sm">
                Share your favorite albums with friends and family or keep them
                private for your own enjoyment.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="mt-24 border-t">
        <div className="text-muted-foreground container mx-auto px-4 py-8 text-center text-sm">
          <p>
            All your photos organized, edited, and shared in one beautiful
            place.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
