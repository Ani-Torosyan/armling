"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const SuccessPayment = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center text-center gap-y-5 max-w-[988px] mx-auto py-40">
        <h1 className="text-xl lg:text-3xl font-bold text-customDark max-w-[480px]">
          Payment Succeeded!
        </h1>

        <Button size="lg" variant="primaryOutline" type="submit">
          <Link href="/learn">Back to learn page</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPayment;