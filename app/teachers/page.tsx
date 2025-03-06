"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { Footer } from "./footer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return error === "not-a-teacher" ? (
    <div style={{ color: "red", fontWeight: "bold" }}>
      You are not authorized to review student assignments.
    </div>
  ) : null;
}

export default function Home() {
  return (
    <ClerkProvider>
      <div className="bg-custom h-screen w-full">
        <div className="flex items-center justify-center mt-10">
          <div className="flex flex-col items-center justify-center max-w-[988px] gap-y-5 text-center mt-10">
            <Suspense fallback={<Loader className="h-5 w-5 text-muted-foreground animate-spin" />}>
              <ErrorMessage />
            </Suspense>

            <div className="h-[10vh]"></div>
            <h1 className="text-xl lg:text-3xl font-bold text-customDark max-w-[480px] mt-10">
              Teach, review, and grade with ArmLing!
            </h1>
            <ClerkLoading>
              <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton forceRedirectUrl={"/reviews/writing-review"}>
                  <Button size="lg" variant="secondary" type="submit">
                    I am a teacher
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Suspense fallback={null}>
                  <ErrorMessage />
                </Suspense>
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/reviews/writing-review">I am a teacher</Link>
                </Button>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <img src="/teachers-cropped.svg" className="h-1/2 w-1/2 mt-10" alt="Hero" />
        </div>
      </div>
      <Footer />
    </ClerkProvider>
  );
}







