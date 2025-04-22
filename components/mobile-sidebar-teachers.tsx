import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet";

import { TeacherSidebar } from "@/components/teacherSidebar";
import { Menu } from "lucide-react";

export const MobileSidebarTeachers = () => {
    return (
        <Sheet>
            <SheetTrigger>
                <Menu />
            </SheetTrigger>
            <SheetContent className="p-0 z-[100]" side="left">
                <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle> {}
                <TeacherSidebar />
            </SheetContent>
        </Sheet>
    );
};