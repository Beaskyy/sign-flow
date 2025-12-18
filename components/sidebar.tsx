// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useState } from "react";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// import { PanelLeft, Plus } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useStateContext } from "@/providers/ContextProvider";
// import { Button } from "./ui/button";
// import { ChatSection } from "./chat-section";
// import { SidebarProfile } from "./sidebar-profile";

// const Sidebar = () => {
//   const {} = useStateContext();
//   const { activeMenu, setActiveMenu } = useStateContext();
//   const [activeLink, setActiveLink] = useState("");
//   const [selectedAssociation, setSelectedAssociation] = useState<string | null>(
//     null
//   );

//   return (
//     <>
//       <div className="hidden lg:flex flex-col justify-between h-screen p-3 bg-[#F5F5F5] min-h-screen lg:overflow-hidden overflow-auto lg:hover:overflow-auto px-4 z-50 shrink-0 pb-[34px] transition ease-in duration-1000">
//         <div className="flex flex-col gap-4">
//           {/* Logo Section */}
//           <div className="flex justify-between items-center pt-6 pb-10">
//             <Link href="/" className="flex items-center gap-1">
//               <Image
//                 src="/logo.svg"
//                 alt="Logo"
//                 width={20}
//                 height={20}
//                 className="cursor-pointer"
//               />
//               <p className="text-[#333333] text-sm font-medium tracking-[-0.3px]">
//                 Signflow
//               </p>
//             </Link>
//             {activeMenu && (
//               <Tooltip>
//                 <TooltipTrigger>
//                   <PanelLeft
//                     onClick={() => setActiveMenu(!activeMenu)}
//                     className="text-[#ABABAB] size-6"
//                   />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p className="text-[10px] font-medium">close sidebar</p>
//                 </TooltipContent>
//               </Tooltip>
//             )}
//           </div>
//           {/* New Chat Button */}
//           <Button className="flex items-center gap-1 py-3 px-1 hover:opacity-80 transition-opacity bg-transparent w-fit hover:bg-transparent">
//             <div className="flex items-center justify-center size-4 rounded-full bg-[#D4AF37] text-white">
//               <Plus className="size-3" />
//             </div>
//             <p className="text-[11px] font-medium text-[#D4AF37]">New chat</p>
//           </Button>
//           {/* Chat History Section - Reusable component */}
//           {[
//             { title: "Today", items: 3 },
//             { title: "Yesterday", items: 2 },
//             { title: "Last 7 Days", items: 2 },
//           ].map((section, idx) => (
//             <ChatSection
//               key={idx}
//               title={section.title}
//               itemCount={section.items}
//             />
//           ))}
//         </div>
//         <SidebarProfile />
//       </div>
//     </>
//   );
// };

// export default Sidebar;


"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PanelLeft, Plus } from "lucide-react";

import { useStateContext } from "@/providers/ContextProvider";
import { Button } from "./ui/button";
import { ChatSection } from "./chat-section";
import { SidebarProfile } from "./sidebar-profile";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversation";
import { useUpdateConversation } from "@/hooks/useUpdateConversation";
import { useDeleteConversation } from "@/hooks/useDeleteConversation";

const Sidebar = () => {
  const {} = useStateContext();
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();
  const { activeMenu, setActiveMenu } = useStateContext();
  const [activeLink, setActiveLink] = useState("");
  const [selectedAssociation, setSelectedAssociation] = useState<string | null>(
    null
  );

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await updateConversation.mutateAsync({ id, title: newTitle });
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSelect = (id: string) => {
    router.push(`/conversations/${id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group conversations by time period
  const today =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }) || [];

  const yesterday =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      return date.toDateString() === yesterdayDate.toDateString();
    }) || [];

  const previous7Days =
    conversations?.filter((conv) => {
      const date = new Date(conv.created_at);
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return (
        date > sevenDaysAgo &&
        date.toDateString() !== now.toDateString() &&
        date.toDateString() !==
          new Date(now.setDate(now.getDate() - 1)).toDateString()
      );
    }) || [];

  return (
    <>
      <div className="hidden lg:flex flex-col justify-between h-screen p-3 bg-[#F5F5F5] min-h-screen lg:overflow-hidden overflow-auto lg:hover:overflow-auto px-4 z-50 shrink-0 pb-[34px] transition ease-in duration-1000">
        <div className="flex flex-col gap-4">
          {/* Logo Section */}
          <div className="flex justify-between items-center pt-6 pb-10">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={20}
                height={20}
                className="cursor-pointer"
              />
              <p className="text-[#333333] text-sm font-medium tracking-[-0.3px]">
                Signflow
              </p>
            </Link>
            {activeMenu && (
              <Tooltip>
                <TooltipTrigger>
                  <PanelLeft
                    onClick={() => setActiveMenu(!activeMenu)}
                    className="text-[#ABABAB] size-6"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] font-medium">close sidebar</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {/* New Chat Button */}
          <Button className="flex items-center gap-1 py-3 px-1 hover:opacity-80 transition-opacity bg-transparent w-fit hover:bg-transparent">
            <div className="flex items-center justify-center size-4 rounded-full bg-[#D4AF37] text-white">
              <Plus className="size-3" />
            </div>
            <p className="text-[11px] font-medium text-[#D4AF37]">New chat</p>
          </Button>
          {/* Chat History Section - Reusable component */}
          <div className="space-y-4">
            <ChatSection
              title="Today"
              conversations={today}
              onRename={handleRename}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
            <ChatSection
              title="Yesterday"
              conversations={yesterday}
              onRename={handleRename}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
            <ChatSection
              title="Previous 7 Days"
              conversations={previous7Days}
              onRename={handleRename}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
          </div>
        </div>
        <SidebarProfile />
      </div>
    </>
  );
};

export default Sidebar;
