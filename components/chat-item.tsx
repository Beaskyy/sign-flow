// import { Ellipsis, Pencil, Share2 } from "lucide-react";
// import { Input } from "@/components/ui/input";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import Image from "next/image";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useState } from "react";
// import { Button } from "./ui/button";

// export const ChatItem = () => {
//   const [open, setOpen] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <button className="flex items-center justify-between w-full py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333] transition-colors">
//       <p className="lg:text-xs text-[10px] truncate">
//         A statement or more info
//       </p>
//       <Popover>
//         <PopoverTrigger>
//           <Ellipsis className="size-3 flex-shrink-0" />
//         </PopoverTrigger>
//         <PopoverContent className="w-[134px] bg-white rounded-md drop-shadow-sm p-0">
//           <div className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]">
//             <Share2 className="size-[15px] text-[#404040]" />
//             <p className="text-[8.47px] text-[#101928] font-medium">Share</p>
//           </div>
//           <div
//             onClick={() => setOpen(true)}
//             className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]"
//           >
//             <Pencil className="size-[15px] text-[#404040]" />
//             <p className="text-[9.24px] text-[#101928] font-medium">Rename</p>
//           </div>
//           <div
//             onClick={() => setIsOpen(true)}
//             className="flex items-center gap-1.5 h-7 py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA] border-t border-[#F0F2F5] text-[#B3261E]"
//           >
//             <Image src="/trash.svg" alt="trash" width={15} height={15} />
//             <p className="text-[9px] font-medium">Delete</p>
//           </div>
//         </PopoverContent>
//       </Popover>
//       {/* Rename Dialog */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="[&>button]:hidden">
//           <DialogHeader>
//             <DialogTitle className="text-[#454545] text-left text-lg tracking-[-2%] font-medium leading-[120%]">
//               Rename this chat
//             </DialogTitle>
//             <DialogDescription>
//               <div className="py-3">
//                 <Input className="p-4 rounded-md h-14 border-[2px] border-[#EBDAA3] placeholder:text-sm text-[#5E5E5E]" type="text" placeholder="Chat Title Name" />
//               </div>
//               <div className="flex justify-end items-center gap-1 pt-4">
//                 <Button
//                   onClick={() => setOpen(false)}
//                   className="w-[82px] h-[33px] rounded-[23.5px] bg-transparent text-[#404040] text-[10.28px] mb-2"
//                 >
//                   Cancel
//                 </Button>
//                 <Button className="w-[82px] h-[33px] rounded-[23.5px] bg-[#D4AF37] hover:bg-[#d4af37ef]  text-white text-[10.28px] mb-2">
//                   Rename
//                 </Button>
//               </div>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Dialog */}
//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent className="[&>button]:hidden flex pt-5 pb-2 px-4 max-w-[340px] rounded-lg">
//           <DialogHeader>
//             <DialogTitle className="text-[#454545] text-left text-lg tracking-[-2%] font-medium leading-[120%]">
//               Delete chat?
//             </DialogTitle>
//             <DialogDescription>
//               <div className="text-left flex flex-col gap-3 text-[11.75px] text-[#757575]">
//                 <p className="text-[#545050]">
//                   This will delete{" "}
//                   <span className="font-bold">Chat Title Name.</span>
//                 </p>
//                 <p>
//                   This action will delete prompts, responses, chat conversation
//                   and all activities that you been generated and created.
//                 </p>
//               </div>
//             </DialogDescription>
//             <div className="flex justify-end items-center gap-1">
//               <Button
//                 onClick={() => setIsOpen(false)}
//                 className="w-[82px] h-[33px] rounded-[23.5px] bg-transparent text-[#404040] text-[10.28px] mb-2"
//               >
//                 Cancel
//               </Button>
//               <Button className="w-[82px] h-[33px] rounded-[23.5px] bg-[#B3261E] text-white text-[10.28px] mb-2">
//                 Delete
//               </Button>
//             </div>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </button>
//   );
// };

import { Ellipsis, Pencil, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";

interface ChatItemProps {
  id: string;
  title: string;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const ChatItem = ({ id, title, onRename, onDelete, onSelect }: ChatItemProps) => {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRename = () => {
    if (newTitle.trim() && onRename) {
      onRename(id, newTitle);
      setOpen(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
      setIsOpen(false);
    }
  };

  return (
    <div 
      onClick={() => onSelect?.(id)}
      className="flex items-center justify-between w-full py-1 px-1.5 hover:bg-[#EAEAEA] rounded-[20px] text-[#333333] transition-colors"
    >
      <p className="lg:text-xs text-[10px] truncate">
        {title}
      </p>
      <Popover>
        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
          <Ellipsis className="size-3 flex-shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-[134px] bg-white rounded-md drop-shadow-sm p-0">
          <div className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]">
            <Share2 className="size-[15px] text-[#404040]" />
            <p className="text-[8.47px] text-[#101928] font-medium">Share</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="flex items-center gap-1.5 h-[27.72px] py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA]"
          >
            <Pencil className="size-[15px] text-[#404040]" />
            <p className="text-[9.24px] text-[#101928] font-medium">Rename</p>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 h-7 py-1.5 px-3 hover:cursor-pointer hover:bg-[#FAFAFA] border-t border-[#F0F2F5] text-[#B3261E]"
          >
            <Image src="/trash.svg" alt="trash" width={15} height={15} />
            <p className="text-[9px] font-medium">Delete</p>
          </div>
        </PopoverContent>
      </Popover>
      {/* Rename Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="[&>button]:hidden" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-[#454545] text-left text-lg tracking-[-2%] font-medium leading-[120%]">
              Rename this chat
            </DialogTitle>
            <DialogDescription>
              <div className="py-3">
                <Input 
                  className="p-4 rounded-md h-14 border-[2px] border-[#EBDAA3] placeholder:text-sm text-[#5E5E5E]" 
                  type="text" 
                  placeholder="Chat Title Name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="flex justify-end items-center gap-1 pt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                  className="w-[82px] h-[33px] rounded-[23.5px] bg-transparent text-[#404040] text-[10.28px] mb-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="w-[82px] h-[33px] rounded-[23.5px] bg-[#D4AF37] hover:bg-[#d4af37ef]  text-white text-[10.28px] mb-2"
                >
                  Rename
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="[&>button]:hidden flex pt-5 pb-2 px-4 max-w-[340px] rounded-lg" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-[#454545] text-left text-lg tracking-[-2%] font-medium leading-[120%]">
              Delete chat?
            </DialogTitle>
            <DialogDescription>
              <div className="text-left flex flex-col gap-3 text-[11.75px] text-[#757575]">
                <p className="text-[#545050]">
                  This will delete{" "}
                  <span className="font-bold">{title}.</span>
                </p>
                <p>
                  This action will delete prompts, responses, chat conversation
                  and all activities that you been generated and created.
                </p>
              </div>
            </DialogDescription>
            <div className="flex justify-end items-center gap-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="w-[82px] h-[33px] rounded-[23.5px] bg-transparent text-[#404040] text-[10.28px] mb-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-[82px] h-[33px] rounded-[23.5px] bg-[#B3261E] text-white text-[10.28px] mb-2"
              >
                Delete
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
