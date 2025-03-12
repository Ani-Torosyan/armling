import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "../footer";

export default function About() {
  return (
    <>
        <div className="w-full min-h-screen bg-custom text-customDark p-10 flex flex-col items-center text-center">
            <img src="/image-gata.svg" alt="Gata" className="w-2/3 max-w-[300px]"/>
            <div className="h-[5vh]"></div>

            <h1 className="text-3xl font-bold mb-6">About ArmLing</h1>

            <div className="h-[3vh]"></div>

            <div className="flex flex-col md:flex-row gap-6 max-w-4xl">
                
                <div className="w-1/3 hidden md:block">
                    </div>

                    <div className="text-lg text-center md:text-left">
                        <p className="text-lg text-center">
                            At ArmLing, we’re on a mission to make learning Armenian as fun as a plate of gata and as effective as your grandma’s advice—whether you asked for it or not. Whether you're a beginner struggling to roll your “ռ” or a fluent speaker looking to impress at family gatherings, we’ve got you covered! Our interactive lessons, practical exercises, and cultural immersion techniques will get you speaking Armenian with confidence (and maybe even a little sass).
                        </p>
                    </div>

                    <div className="w-1/3 hidden md:block">
                    
                </div>
            </div>
            
            <div className="h-[8vh]"></div>

            <img src="/teachers-cropped.svg" alt="Gata" className="w-2/3 max-w-[700px]"/>

            <div className="h-[30vh]"></div>

            <div className="flex items-center justify-center space-x-4 max-w-7xl">
                <img src="/image-lit.svg" alt="Our Vision" className="w-2/3 max-w-[700px]" />
                <div className="flex flex-col items-center justify-center space-y-2">
                    <h2 className="text-2xl font-bold">Our Vision</h2>
                    <p className="text-center">
                        We believe that learning a language isn’t just about memorizing words and grammar—it’s about connecting with culture, history, and people. After all, what’s the point of knowing how to say “բարև” (hello) if you don’t know when to expect a warm hug and a plate of food right after? At ArmLing, we combine technology and tradition to create an experience that is engaging, rewarding, and deeply immersive. We want you to think in Armenian, dream in Armenian, and—why not?—even argue in Armenian (because let’s be honest, that’s when you know you’ve truly mastered a language).
                    </p>
                </div>
            </div>

            <div className="h-[30vh]"></div>


            <h2 className="text-2xl font-bold mt-10">Why Choose Us?</h2>
            <ul className="list-disc text-lg max-w-4xl text-center mt-2">
                <li>Whether you’re a total beginner or already whispering sweet nothings in Armenian, our lessons adapt to your level and help you progress naturally.</li>

                <li>Boring drills? Not here! We offer a variety of challenges, from listening and speaking exercises to fun quizzes and storytelling.</li>

                <li>Learning alone is hard, so we’ve built a friendly and active community where learners can ask questions, share progress, and even practice their favorite Armenian jokes.</li>

                <li>Language and culture go hand in hand! We provide in-depth stories, traditions, and fun facts—because knowing how to order khorovats is just as important as knowing grammar.</li>

                <li>Because let’s face it, sometimes textbooks won’t teach you how to respond when someone says, “Ապրես!” (Well done!).</li>
            </ul>

            <div className="h-[3vh]"></div>

            <img src="/cat.svg" alt="cat" className="w-2/3 max-w-[500px]" />

            <div className="h-[30vh]"></div>
        </div>

        <div className="w-full h-full bg-custom flex flex-col items-center text-center"><p><span className="text-lg font-light italic">P.S. Did you know that the word "Armenia" is believed to come from the name of the legendary king, Aram? So, when you speak Armenian, you’re carrying on the legacy of ancient royalty!</span></p></div>

        <div className="h-[2vh] w-full bg-custom"></div>

        <Footer />
    </>
  );
}
