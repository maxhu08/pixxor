"use client";

import { Button } from "@/components/ui/button";

interface FinishOnboardingProps {
  onSuccess: () => void;
}

export function FinishOnboarding({ onSuccess }: FinishOnboardingProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex grow flex-col items-center justify-center space-y-2 px-8 text-center">
        <h2 className="text-xl font-medium">You're All Set!</h2>
        <p className="text-muted-foreground max-w-md">Ready to start using the platform.</p>
      </div>
      <div className="flex justify-end p-4">
        <Button onClick={onSuccess} className="cursor-pointer">
          Finish
        </Button>
      </div>
    </div>
  );
}