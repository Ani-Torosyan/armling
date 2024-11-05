import { Button } from "@/components/ui/button";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <ClerkProvider>
      <div className="h-screen w-full bg-custom flex items-center justify-center">
        <div className="max-w-[988px] w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
          <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
            <Image src="/marketing.svg" fill alt="Hero" />
          </div>
          <div className="flex flex-col items-center gap-y-8">
            <h1 className="text-xl lg:text-3xl font-bold text-customDark max-w-[480px] text-center">
              Learn, practice, and master Armenian with ArmLing!
            </h1>
            <ClerkLoading>
              <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignUpButton>
                  <Button size="lg" variant="secondary">
                    Get Started!
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button size="lg" variant="primaryOutline" type="submit">
                    I already have an account.
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/learn">Continue Learning.</Link>
                </Button>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
  
}



