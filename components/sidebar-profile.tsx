import { ChevronDown } from "lucide-react";

export const SidebarProfile = () => {
  return (
    <div className="py-2 pr-3 flex justify-between items-center cursor-pointer">
      <div className="flex items-center gap-[9.35px]">
        <div className="flex justify-center items-center lg:size-7 size-6 rounded-full bg-[#DDBF5F]">
          <h4 className="lg:text-xs text-[10px] text-[#101928] font-semibold">GA</h4>
        </div>
        <div className="flex flex-col">
          <p className="lg:text-xs text-[10px] text-[#2B2B2B] font-medium">Gbolahan Adekola</p>
          <p className="lg:text-[10px] text-[8px] text-[#575757]">Gbolahan Adekola</p>
        </div>
      </div>
      <ChevronDown className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#667185]" />
    </div>
  );
};
