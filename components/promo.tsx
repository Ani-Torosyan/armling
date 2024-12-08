"use client";

import Image from "next/image"
import { Button } from "./ui/button";
import Link from "next/link";

export  const Promo = () => {
    return (
        <div className="border-2 border-customShade rounded-xl p-4 space-y-4 text-customDark">
            <div className="space-y-2">
                <div className="flex items-center gap-x-2">
                    <Image src="unlimited.svg" alt="Pro" height={26} width={26}/>
                    <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                </div>
            </div>  
            <div className="space-y-6">
                <p className="text-customShade mb-4">Get unlimited hearts!</p>
                <Link href="/shop" className="mt-4">
                    <Button variant="super" className="w-full" size="lg">
                        Upgrade today
                    </Button>
                </Link>
            </div>
        </div>
    );
}