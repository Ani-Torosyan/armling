import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

type Props = {
    children: React.ReactNode;
};

const MainLayout = ({ children }: Props) =>{
    return (
        <>
            <MobileHeader />
            <Sidebar className="hidden lg:flex"/>
                <main className="lg:pl-[256px] h-full lg:pt-0">
                    <div className="bg-customMid min-h-screen">
                        <div className="max-w-[1056px] mx-auto pt-6 h-full">
                            {children}                
                        </div>
                    </div>
                </main>   
            
        </>
    );
};

export default MainLayout;