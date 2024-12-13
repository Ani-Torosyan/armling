import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="w-full bg-customMid text-customDark py-2">
            <div className="lg:max-w-screen-lg mx-auto flex flex-col items-center space-y-1">
                <h2 className="text-xl font-bold">Stay Connected</h2>
                <div className="flex space-x-6">
                    <Link href="https://facebook.com/armling" target="_blank">
                        <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
                    </Link>
                    <Link href="https://twitter.com/armling" target="_blank">
                        <img src="/twitter-icon.svg" alt="Twitter" className="w-6 h-6" />
                    </Link>
                    <Link href="https://instagram.com/armling" target="_blank">
                        <img src="/instagram-icon.svg" alt="Instagram" className="w-6 h-6" />
                    </Link>
                </div>
                <p className="text-sm">
                    © {new Date().getFullYear()} ArmLing. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
