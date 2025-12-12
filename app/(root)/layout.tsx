"use client";


import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useStateContext } from "@/providers/ContextProvider";
import { usePathname, useRouter } from "next/navigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { activeMenu, setActiveMenu, screenSize } = useStateContext();

  const pathname = usePathname();

  const handleCloseSidebar = () => {
    // @ts-ignore
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };
  return (
    <main>
      <div
        className="flex relative"
        onClick={() => {
          if (activeMenu) {
            handleCloseSidebar();
          }
        }}
      >
        {activeMenu && (
          <div className="w-[252px] fixed z-50 bg-white left-0">
            <Sidebar />
          </div>
        )}
        <div
          className={`min-h-screen w-full ${
            activeMenu ? "lg:ml-64" : "flex-2"
          }`}
        >
          <div className="fixed lg:static w-full z-20">
            <Header />
          </div>
        </div>
        <div
          className={`absolute top-20 transition-all duration-300 ${
            activeMenu
              ? "lg:w-custom w-full overflow-hidden lg:left-[252px]"
              : "w-full lg:left-0"
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default MainLayout;
