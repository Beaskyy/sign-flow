"use client";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Link from "next/link";
import { Navigation } from "./navigation";
import { useStateContext } from "@/providers/ContextProvider";
import {
  ChevronRight,
  ChevronsRight,
  EllipsisVertical,
  PanelRight,
} from "lucide-react";

const Header = () => {
  const { activeMenu, setActiveMenu } = useStateContext();

  const logout = async () => {};
  return (
    <header
      className={`fixed  z-20 w-full bg-white transition-all duration-300 ${
        activeMenu ? "lg:left-[252px] lg:w-custom" : "lg:left-0"
      }`}
    >
      <div className="flex justify-between items-center py-3">
        <div className="lg:pl-10 pl-4">
          {activeMenu ? (
            <h5 className="hidden lg:flex text-sm font-normal leading-[20.3px] text-[#5D5D5D]"></h5>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <div>
                <Link
                  href="/"
                >
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={20}
                    height={20}
                    className="lg:size-10 size-5"
                  />
                </Link>
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger>
                    <PanelRight
                      onClick={() => setActiveMenu(!activeMenu)}
                      className="text-[#ABABAB]"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] font-medium">open sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
          <div className="lg:hidden">
            <Navigation />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical className="" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
