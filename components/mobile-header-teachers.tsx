import { MobileSidebarTeachers } from "@/components/mobile-sidebar-teachers";

export const MobileHeaderTeachers = () => {
    return (
        <nav className="lg:hidden px-8 h-[70px] flex items-center fixed top-0 w-[256px] z-50">
            <MobileSidebarTeachers />
        </nav>
    );
};