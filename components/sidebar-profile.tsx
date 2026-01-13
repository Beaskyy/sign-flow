import { Check, ChevronDown, ChevronRight, Globe, Info, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const SidebarProfile = () => {
  const session = useSession();
  const user = session.data?.user;
  const [selectedLanguage, setSelectedLanguage] = useState("nigeria");

  return (
    <div>
      <Popover>
        <PopoverTrigger className="py-2 pr-3 flex justify-between items-center cursor-pointer">
          <div className="flex items-center gap-[9.35px]">
            {user?.image ? (
              <div className="relative flex justify-center items-center lg:size-7 size-6 rounded-full bg-[#DDBF5F]">
                <Image
                  src={user?.image}
                  alt="image"
                  fill
                  className="absolute object-cover rounded-full"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center lg:size-7 size-6 rounded-full bg-[#DDBF5F]">
                <h4 className="lg:text-xs text-[10px] text-[#101928] font-semibold">
                  {user?.name?.split(" ")[0]?.charAt(0)}
                  {user?.name?.split(" ")[1]?.charAt(0)}
                </h4>
              </div>
            )}
            <div className="flex flex-col items-start">
              <p className="lg:text-xs text-[10px] text-[#2B2B2B] font-medium">
                {user?.name?.split(" ")[0]} {user?.name?.split(" ")[1]}
              </p>
              <p className="lg:text-[10px] text-[8px] text-[#575757]">
                {user?.email}
              </p>
            </div>
          </div>

          <ChevronDown className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#667185]" />
        </PopoverTrigger>
        <PopoverContent className="rounded-[14px] w-[253px] p-0">
          <div className="flex items-center gap-[9.35px] h-[43px] px-2 py-5">
            {user?.image ? (
              <div className="relative flex justify-center items-center lg:size-7 size-6 rounded-full bg-[#DDBF5F]">
                <Image
                  src={user?.image}
                  alt="image"
                  fill
                  className="absolute object-cover rounded-full"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center lg:size-7 size-6 rounded-full bg-[#DDBF5F]">
                <h4 className="lg:text-xs text-[10px] text-[#101928] font-semibold">
                  {user?.name?.split(" ")[0]?.charAt(0)}
                  {user?.name?.split(" ")[1]?.charAt(0)}
                </h4>
              </div>
            )}
            <div className="flex flex-col">
              <p className="lg:text-xs text-[10px] text-[#2B2B2B] font-medium">
                {user?.name?.split(" ")[0]} {user?.name?.split(" ")[1]}
              </p>
              <p className="lg:text-[10px] text-[8px] text-[#575757]">
                {user?.email}
              </p>
            </div>
          </div>
          <hr className="text-[#F0F2F5] mt-2" />
          <div className="flex flex-col">
            <div className="flex items-center gap-3 hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer">
              <Settings className="size-4 text-[#333333]" />
              <p className="text-sm text-[#101928] font-normal">Settings</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex justify-between items-center hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer w-full">
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-[#333333]" />
                    <p className="text-sm text-[#101928] font-normal">
                      Language
                    </p>
                  </div>
                  <ChevronRight className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#191D31]" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="start"
                className="min-w-[8rem] p-1"
              >
                {/* USA Option */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setSelectedLanguage("usa")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Image src="/usa.svg" alt="usa" width={15} height={15} />
                      <span className="text-[#101928] text-xs font-medium">
                        ASL
                      </span>
                    </div>
                    {selectedLanguage === "usa" && (
                      <Check className="h-3.5 w-3.5 text-[#101928]" />
                    )}
                  </div>
                </DropdownMenuItem>

                {/* UK Option */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setSelectedLanguage("uk")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Image src="/uk.svg" alt="uk" width={15} height={15} />
                      <span className="text-[#101928] text-xs font-medium">
                        BSL
                      </span>
                    </div>
                    {selectedLanguage === "uk" && (
                      <Check className="h-3.5 w-3.5 text-[#101928]" />
                    )}
                  </div>
                </DropdownMenuItem>

                {/* Nigeria Option */}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setSelectedLanguage("nigeria")}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/nigeria.svg"
                        alt="nigeria"
                        width={15}
                        height={15}
                      />
                      <span className="text-[#101928] text-xs font-medium">
                        NSL
                      </span>
                    </div>
                    {selectedLanguage === "nigeria" && (
                      <Check className="h-3.5 w-3.5 text-[#101928]" />
                    )}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-3 hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer">
              <Image
                src="/personalisation.svg"
                alt="personalisation"
                width={20}
                height={20}
                className="size-4 text-[#333333]"
              />
              <p className="text-sm text-[#101928] font-normal">
                Personalisation
              </p>
            </div>
          </div>
          <hr className="text-[#F0F2F5]" />
          <div className="flex flex-col">
            <div className="flex justify-between items-center hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Image
                  src="/question.svg"
                  alt="question"
                  width={20}
                  height={20}
                  className="size-4 text-[#333333]"
                />
                <p className="text-sm text-[#101928] font-normal">Get help</p>
              </div>
              <ChevronRight className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#191D31]" />
            </div>
            <div className="flex justify-between items-center hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Info className="size-5 text-[#333333]" />
                <p className="text-sm text-[#101928] font-normal">Learn more</p>
              </div>
              <ChevronRight className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#191D31]" />
            </div>
          </div>
          <hr className="text-[#F0F2F5]" />
          <div className="flex items-center p-3 gap-3 hover:bg-[#F5F5F5] py-2 px-3 cursor-pointer h-12">
            <Image
              src="/logout.svg"
              alt="logout"
              width={20}
              height={20}
              className="size-4 text-[#333333]"
            />
            <p className="text-sm text-[#101928] font-normal">Log out</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
