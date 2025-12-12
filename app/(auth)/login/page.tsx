"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const Login = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <main className="flex flex-col justify-between items-center text-center min-h-screen pb-6 md:py-24">
      <div className="flex flex-col justify-center items-center gap-12 mt-40">
        <Image src="/logo.png" alt="logo" width={130} height={130} />
        <div className="flex flex-col gap-2">
          <h2 className="text-black text-4xl tracking-[-1.5px] font-semibold leading-[120%]">
            Meet SignFlow.
          </h2>
          <p className="text-[#333333] text-xl font-medium md:w-full w-[292px]">
            Translate text, speech, and audio into sign.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Button
          onClick={() => signIn("google")}
          className="bg-white border border-[#F5F5F5] shadow-sm rounded-3xl md:w-[343px] w-full h-[53px] py-4 px-[18px] flex justify-center items-center hover:bg-white/75"
        >
          <div className="flex items-center gap-2 w-[196px] text-[#344054] font-semibold">
            <Image src="/google.svg" alt="google" width={20} height={20} />
            <p>Continue with Google</p>
          </div>
        </Button>
        <div className="max-w-[291px]">
          <p className="text-xs tracking-[-0.2px] text-black">
            By continuing, you agree to SignFlow{" "}
            <Link href="/terms" className="text-[#D4AF37]">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#D4AF37]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
      {/* success dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="[&>button]:hidden flex justify-center items-center text-center pt-5 pb-2 px-4 max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-[#454545] text-xl tracking-[-2%] font-semibold leading-[120%]">
              You&apos;re all set!
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-2 text-[11.75px] text-[#757575]">
                <p>
                  You can now translate text, speech and audio into sign
                  language, including:
                </p>
                <ul>
                  <li>• Type to sign</li>
                  <li>• Speak to sign</li>
                  <li>• Upload audio for sign</li>
                </ul>
              </div>
            </DialogDescription>
            <DialogFooter className="pt-4">
              <Button className="w-full h-[33px] rounded-[23.5px] bg-[#D4AF37] hover:bg-[#d4af37ef] mb-2">Get Started</Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Login;
