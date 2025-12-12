import Image from "next/image";

export const Avatar = () => {
  return (
    <div className="relative lg:w-full w-[343px] h-[456px] bg-[#E7E7E7CC] rounded-lg">
      <div className="flex justify-center items-center p-1.5 h-9 bg-[#D2D2D2BA] rounded-t-lg">
        <p className="text-sm text-[#40404099] font-medium">
          Type, speak, or upload to begin
        </p>
      </div>
      <div className="flex justify-center items-center">
        <Image src="/avatar.svg" alt="avatar" width={258} height={377} />
      </div>
      <div className="absolute right-0 -bottom-10 z-50">
        <Image src="/fab.svg" alt="fab" width={100} height={33} />
      </div>
    </div>
  );
};
