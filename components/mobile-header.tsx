import { MobileSidebar } from "./mobile-sidebar";

export const MobileHeader = () => {
    return (
        <nav className="lg:hidden px-8 h-[70px] flex items-center fixed top-0 w-[256px] z-50">
            <MobileSidebar />
        </nav>
    );
};