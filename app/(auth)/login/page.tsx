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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Login = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setIsOpen(true);
          // Redirect will be handled by the "Get Started" button in the dialog
          // or we can auto-redirect after a delay
        },
        onError: (error) => {
          console.error("Login failed:", error);
          toast.error(error.message || "Login failed. Please check your credentials.");
        },
      }
    );
  };

  return (
    <main className="flex flex-col justify-between items-center text-center min-h-screen py-6">
      <div className="flex flex-col justify-center items-center gap-12">
        <Image src="/logo.png" alt="logo" width={130} height={130} className="md:size-[130px] size-[80px]" />
        <div className="flex flex-col gap-2">
          <h2 className="text-black md:text-4xl text-2xl tracking-[-1.5px] font-semibold leading-[120%]">
            Meet SignFlow.
          </h2>
          <p className="text-[#333333] md:text-xl text-sm font-medium md:w-full w-[292px]">
            Translate text, speech, and audio into sign.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-[343px] px-4">
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="email" className="text-sm font-medium text-[#454545]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-[#454545]"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
            />
          </div>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-[53px] rounded-3xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-semibold flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-[#F5F5F5] flex-1" />
          <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider">
            OR
          </span>
          <div className="h-px bg-[#F5F5F5] flex-1" />
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
        <p className="text-sm text-[#757575] mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#D4AF37] font-semibold hover:underline">
            Register
          </Link>
        </p>
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
              <Button 
                onClick={() => router.push("/")}
                className="w-full h-[33px] rounded-[23.5px] bg-[#D4AF37] hover:bg-[#d4af37ef] mb-2"
              >
                Get Started
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Login;
