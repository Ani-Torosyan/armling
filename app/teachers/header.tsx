import { ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export const Header = () => {
    return (
        <header className="sticky top-0 h-20 w-full border-b-2 border-customMid px-4 bg-custom">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
                <Link href="/teachers">
                    <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                        <Image src="/funny.svg" height={70} width={70} alt="Mascot" />
                        <h1 className="text-2xl font-extrabold text-customDark tracking-wide">
                            ArmLing <span className="text-lg font-light italic">teachers</span>
                        </h1>
                    </div>
                </Link>
                <ClerkLoaded>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </ClerkLoaded>
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
            </div>
        </header>
    );
};

