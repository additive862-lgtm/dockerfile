import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { checkAdmin } from "@/app/actions/admin";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await checkAdmin();

    return (
        <div className="min-h-screen bg-[#f9fafb] flex">
            {/* Sidebar with responsiveness built-in */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 ease-in-out">
                {/* 
                   Wait, if Sidebar is NOT collapsed by default but can be, 
                   the margin needs to be dynamic or the sidebar needs to be fixed.
                   My Sidebar implementation uses fixed position.
                */}
                <Header />
                <main className="p-6 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
