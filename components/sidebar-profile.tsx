import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const SidebarProfile = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <div className="py-2 pr-3 flex justify-between items-center cursor-pointer">
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
        <div className="flex flex-col">
          <p className="lg:text-xs text-[10px] text-[#2B2B2B] font-medium">
            {user?.name?.split(" ")[0]} {user?.name?.split(" ")[1]}
          </p>
          <p className="lg:text-[10px] text-[8px] text-[#575757]">
            {user?.email}
          </p>
        </div>
      </div>
      <ChevronDown className="lg:w-5 lg:h-5 w-3.5 h-4 text-[#667185]" />
    </div>
  );
};
