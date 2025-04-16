"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { useRouter } from "next/navigation"; 

const RecommendationsPage = () => {
    const router = useRouter();

    return (
        <div>
            <FeedWrapper>
                <Header title="Recommendations" />
                <div className="space-y-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                    <div className="relative group flex flex-col items-center justify-center rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 p-4 bg-opacity-60 bg-customDark text-custom text-lg font-semibold text-center">
                            Armenian Literature
                        </div>
                        <button
                            onClick={() => router.push("/recommendations/books")}
                            className="w-full h-48 flex items-center justify-center bg-cover bg-center"
                            style={{
                                backgroundImage: `url('/books.svg')`,
                                backgroundSize: "25%",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        >
                            <div className="absolute inset-0 bg-customDark opacity-10 group-hover:opacity-40 transition-opacity"></div>
                        </button>
                    </div>

                    <div className="relative group flex flex-col items-center justify-center rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 p-4 bg-opacity-60 bg-customDark text-custom text-lg font-semibold text-center">
                            <span className="text-lg font-light italic">Coming Soon!</span>
                        </div>
                        <button
                            disabled
                            className="w-full h-48 flex items-center justify-center bg-cover bg-center cursor-not-allowed"
                            style={{
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        >
                            <div className="absolute inset-0 bg-customDark opacity-10"></div>
                            <img
                                src="/lock-and-chain.svg"
                                alt="Locked"
                                className="absolute h-[118%]"
                            />
                        </button>
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default RecommendationsPage;