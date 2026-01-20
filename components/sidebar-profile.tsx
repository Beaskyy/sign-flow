import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Info, 
  Settings, 
  Camera 
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Label } from "@/components/ui/label"; 

const LANGUAGES = [
  { id: "usa", label: "ASL", icon: "/usa.svg" },
  { id: "uk", label: "BSL", icon: "/uk.svg" },
  { id: "nigeria", label: "NSL", icon: "/nigeria.svg" },
];

const HELP_ITEMS = [
  { label: "Help Centre", icon: "/key.svg" },
  { label: "Report Issue", icon: "/key.svg" },
];

const LEARN_ITEMS = [
  { label: "About Signflow", icon: "/key.svg" },
  { label: "Terms & policies", icon: "/key.svg" },
  { label: "Release notes", icon: "/key.svg" },
];

export const SidebarProfile = () => {
  const session = useSession();
  const user = session.data?.user;
  const [selectedLanguage, setSelectedLanguage] = useState("nigeria");
  
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Safe derivation of user details
  const nameParts = (user?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts[1] || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  // Reusable Sub-component for Avatar
  const UserAvatar = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const containerSize = size === "lg" ? "lg:size-7 size-6" : "lg:size-7 size-6";
    const textSize = size === "lg" ? "lg:text-xs text-[10px]" : "lg:text-xs text-[10px]";

    if (user?.image) {
      return (
        <div className={`relative flex justify-center items-center ${containerSize} rounded-full bg-[#DDBF5F]`}>
          <Image
            src={user.image}
            alt={user.name || "User"}
            fill
            className="absolute object-cover rounded-full"
          />
        </div>
      );
    }

    return (
      <div className={`flex justify-center items-center ${containerSize} rounded-full bg-[#DDBF5F]`}>
        <h4 className={`${textSize} text-[#101928] font-semibold`}>{initials}</h4>
      </div>
    );
  };

  // Reusable Sub-component for User Text
  const UserDetails = () => (
    <div className="flex flex-col items-start">
      <p className="lg:text-xs text-[10px] text-[#2B2B2B] font-medium">
        {firstName} {lastName}
      </p>
      <p className="lg:text-[10px] text-[8px] text-[#575757] max-w-[150px] truncate">
        {user?.email}
      </p>
    </div>
  );

  return (
    <div>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger className="w-full py-2 pr-3 flex justify-between items-center cursor-pointer outline-none hover:bg-gray-50/50 rounded-md transition-colors">
          <div className="flex items-center gap-[9.35px]">
            <UserAvatar />
            <UserDetails />
          </div>
          <ChevronDown className={`lg:w-5 lg:h-5 w-3.5 h-4 text-[#667185] transition-transform ${isPopoverOpen ? 'rotate-180' : ''}`} />
        </PopoverTrigger>

        <PopoverContent className="rounded-[14px] w-[253px] p-0" align="start">
          {/* Header */}
          <div className="flex items-center gap-[9.35px] px-3 py-4">
            <UserAvatar size="lg" />
            <UserDetails />
          </div>
          
          <hr className="text-[#F0F2F5]" />

          {/* Main Menu Items */}
          <div className="flex flex-col py-1">
            <MenuItem icon={<Settings className="size-4 text-[#333333]" />} label="Settings" />

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none w-full">
                <div className="flex justify-between items-center hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-[#333333]" />
                    <p className="text-sm text-[#101928]">Language</p>
                  </div>
                  <ChevronRight className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#191D31]" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="min-w-[8rem] p-1">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Image src={lang.icon} alt={lang.label} width={15} height={15} />
                        <span className="text-[#101928] text-xs font-medium">{lang.label}</span>
                      </div>
                      {selectedLanguage === lang.id && <Check className="h-3.5 w-3.5 text-[#101928]" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Personalisation Trigger */}
            <div onClick={() => {
                setIsPopoverOpen(false);
                setIsProfileOpen(true);
            }}>
                <MenuItem 
                icon={<Image src="/personalisation.svg" alt="personalisation" width={20} height={20} className="size-4 text-[#333333]" />} 
                label="Personalisation" 
                />
            </div>
          </div>

          <hr className="text-[#F0F2F5]" />

          {/* Support Section */}
          <div className="flex flex-col py-1">
            <SubMenu 
              triggerIcon={<Image src="/question.svg" alt="question" width={20} height={20} className="size-4 text-[#333333]" />}
              label="Get Help"
              items={HELP_ITEMS}
            />
            
            <SubMenu 
              triggerIcon={<Info className="size-5 text-[#333333]" />}
              label="Learn more"
              items={LEARN_ITEMS}
            />
          </div>

          <hr className="text-[#F0F2F5]" />

          {/* Logout Trigger */}
          <div 
            onClick={() => {
              setIsPopoverOpen(false); 
              setIsLogoutOpen(true);   
            }}
            className="flex items-center gap-3 hover:bg-[#FEF3F2] py-3 px-3 cursor-pointer m-1 rounded-md transition-colors group"
          >
            <Image
              src="/logout.svg"
              alt="logout"
              width={20}
              height={20}
              className="size-4 text-[#333333] group-hover:text-red-600"
            />
            <p className="text-sm text-[#101928] group-hover:text-red-600 font-normal">Log out</p>
          </div>
        </PopoverContent>
      </Popover>

      {/* -------------------- */}
      {/* Logout Confirmation Dialog */}
      {/* -------------------- */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="[&>button]:hidden flex flex-col pt-5 pb-4 px-4 max-w-[340px] rounded-lg gap-0">
          <DialogHeader>
            <DialogTitle className="text-[#454545] text-left text-lg tracking-[-2%] font-medium leading-[120%]">
              Log out of SignFlow?
            </DialogTitle>
            <DialogDescription className="text-left mt-3 mb-6">
              <span className="text-[#545050] text-[11.75px]">
                You&apos;re currently in an active voice session. Logging out will end the session.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsLogoutOpen(false)}
              className="w-[82px] h-[33px] rounded-full text-[#404040] text-[10.28px] hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => signOut()}
              className="w-[82px] h-[33px] rounded-full bg-[#B3261E] hover:bg-[#901e18] text-white text-[10.28px]"
            >
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* -------------------- */}
      {/* Edit Profile Dialog */}
      {/* -------------------- */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="[&>button]:hidden flex flex-col p-6 max-w-[380px] rounded-xl gap-0 bg-white">
          
          <DialogTitle className="text-[#454545] text-left text-[12.7px] font-semibold mb-6">
              Edit profile
          </DialogTitle>

          {/* Large Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex justify-center items-center w-[88px] h-[88px] rounded-full bg-[#FDF8E9]">
                {user?.image ? (
                   <Image
                   src={user.image}
                   alt="profile"
                   fill
                   className="rounded-full object-cover"
                 />
                ) : (
                  <h4 className="text-[28px] text-[#101928] font-bold tracking-tight">
                    {initials}
                  </h4>
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-[#5E5E5E] size-[27px] rounded-full cursor-pointer hover:bg-gray-700 transition">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-[#344054]">Display name</Label>
              <div className="relative">
                <input 
                  disabled 
                  value={user?.name || ""} 
                  className="w-full h-10 px-3 py-2 text-[13px] text-[#667085] bg-[#F5F7FA] border border-[#E4E7EC] rounded-md focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-[#344054]">Email address</Label>
              <div className="relative">
                <input 
                  disabled 
                  value={user?.email || ""} 
                  className="w-full h-10 px-3 py-2 text-[13px] text-[#667085] bg-[#F5F7FA] border border-[#E4E7EC] rounded-md focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] leading-[14px] text-[#ABABAB] mt-6 mb-8 px-2">
            Only your profile photo can be edited for now. <br />
            Your name and email are set when you sign up.
          </p>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsProfileOpen(false)}
              className="h-[36px] px-4 rounded-full text-[#344054] text-[12px] font-medium hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
               onClick={() => {
                // Save Logic goes here
                setIsProfileOpen(false);
              }}
              className="h-[36px] px-6 rounded-full bg-[#D4AF37] hover:bg-[#c9ad54] text-white text-[12px] font-medium shadow-none"
            >
              Save
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Internal Helper Components ---

const MenuItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-3 hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer transition-colors">
    {icon}
    <p className="text-sm text-[#101928] font-normal">{label}</p>
  </div>
);

const SubMenu = ({ triggerIcon, label, items }: { triggerIcon: React.ReactNode; label: string; items: { label: string; icon: string }[] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="outline-none w-full">
      <div className="flex justify-between items-center hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer transition-colors">
        <div className="flex items-center gap-3">
          {triggerIcon}
          <p className="text-sm text-[#101928] font-normal">{label}</p>
        </div>
        <ChevronRight className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#191D31]" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start" className="min-w-[170px] p-1">
      {items.map((item, idx) => (
        <DropdownMenuItem key={idx} className="cursor-pointer">
          <div className="flex justify-between items-center w-full">
            <p className="text-[#101928] text-[10.89px]">{item.label}</p>
            <Image src={item.icon} alt="icon" width={22} height={16} className="text-[#333333]" />
          </div>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);