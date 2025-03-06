import { TeacherSidebar } from "@/components/teacherSidebar";

type Props = {
    children: React.ReactNode;
};

const teacherLayout = ({ children }: Props) =>{
    return (
        <>
            <div className="bg-customMid min-h-screen">
                <TeacherSidebar className="hidden lg:flex"/>
                    <main className="lg:pl-[256px] h-full lg:pt-0">
                        <div className="max-w-[1056px] mx-auto pt-6 h-full">
                            {children}                
                        </div>
                    </main>   
            </div>
        </>
    );
};

export default teacherLayout;