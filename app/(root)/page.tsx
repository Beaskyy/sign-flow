"use client";

import { Avatar } from "@/components/avatar";
import { TextInput } from "@/components/text-input";

export default function Home() {
  return (
    <main className="flex justify-center items-center lg:ml-10 lg:mr-9 mx-4">
      <div className="flex flex-col gap-4 w-full ">
        <Avatar />
        <TextInput />
      </div>
    </main>
  );
}
