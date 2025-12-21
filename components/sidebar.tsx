import { ChatHistory } from "./chat-history";
import { SidebarProfile } from "./sidebar-profile";


const Sidebar = () => {

  return (
    <>
      <div className="hidden lg:flex flex-col justify-between h-screen p-3 bg-[#F5F5F5] min-h-screen lg:overflow-hidden overflow-auto lg:hover:overflow-auto px-4 z-50 shrink-0 pb-[34px] transition ease-in duration-1000">
       <ChatHistory />
        <SidebarProfile />
      </div>
    </>
  );
};

export default Sidebar;