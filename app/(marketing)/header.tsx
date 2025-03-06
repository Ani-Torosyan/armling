import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
    return (
        <header className="sticky top-0 h-20 w-full border-b-2 border-customMid px-4 bg-custom">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
                <Link href="/">
                    <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                        <Image src="/mascot.svg" height={70} width={70} alt="Mascot" />
                        <h1 className="text-2xl font-extrabold text-customDark tracking-wide">
                            ArmLing
                        </h1>
                    </div>
                </Link>
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <div className="flex gap-x-4">
                            <SignInButton>
                                <Button size="lg" variant="sidebar">
                                    Log in
                                </Button>
                            </SignInButton>
                            <SignUpButton>
                                <Button size="lg" variant="primaryOutline">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </div>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </header>
    );
};

