"use client"

import { Avatar } from "@/components/avatar";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession()
  
  useEffect(() => {
    console.log("=== SESSION DEBUG ===")
    console.log("Status:", status)
    console.log("Session:", JSON.stringify(session, null, 2))
    console.log("Access Token:", session?.accessToken)
    console.log("User ID:", session?.user?.id)
    console.log("===================")
  }, [session, status])
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
