"use client"

import { Avatar } from "@/components/avatar";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  
  return (
    <main className="flex justify-center items-center lg:ml-10 lg:mr-9 mx-4">
      <div className="flex flex-col gap-4 w-full">
        <Button onClick={() => signOut()}>logout</Button>
        <Avatar />
        <TextInput />
      </div>
    </main>
  );
}
