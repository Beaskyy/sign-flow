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
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useRegister";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Register = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const registerMutation = useRegister();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }
    registerMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Account created successfully!");
        setIsOpen(true);
      },
      onError: (error) => {
        console.error("Registration failed:", error);
        toast.error(error.message || "Registration failed. Please try again.");
      },
    });
  };

  return (
    <main className="flex flex-col justify-between items-center text-center min-h-screen py-6">
      <div className="flex flex-col justify-center items-center gap-12">
        <Image src="/logo.png" alt="logo" width={130} height={130} className="md:size-[130px] size-[80px]" />
        <div className="flex flex-col gap-2">
          <h2 className="text-black md:text-4xl text-2xl tracking-[-1.5px] font-semibold leading-[120%]">
            Join SignFlow.
          </h2>
          <p className="text-[#333333] md:text-xl text-sm font-medium md:w-full w-[292px]">
            Start your journey of seamless sign translation.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-[343px] px-4 my-8">
        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 text-left">
              <Label htmlFor="first_name" className="text-sm font-medium text-[#454545]">
                First Name
              </Label>
              <Input
                id="first_name"
                placeholder="Jane"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <Label htmlFor="last_name" className="text-sm font-medium text-[#454545]">
                Last Name
              </Label>
              <Input
                id="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="email" className="text-sm font-medium text-[#454545]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="password" className="text-sm font-medium text-[#454545]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor="password_confirm" className="text-sm font-medium text-[#454545]">
              Confirm Password
            </Label>
            <Input
              id="password_confirm"
              type="password"
              placeholder="••••••••"
              value={formData.password_confirm}
              onChange={handleInputChange}
              required
              className="h-[53px] rounded-2xl border-[#E5E5E5] px-4 focus-visible:ring-[#D4AF37]"
            />
          </div>
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-[53px] rounded-3xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Creating account...
              </>
            ) : (
              "Create Account"
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

        <Button
          onClick={() => signIn("google")}
          className="bg-white border border-[#F5F5F5] shadow-sm rounded-3xl w-full h-[53px] py-4 px-[18px] flex justify-center items-center hover:bg-white/75"
        >
          <div className="flex items-center gap-2 text-[#344054] font-semibold">
            <Image src="/google.svg" alt="google" width={20} height={20} />
            <p>Continue with Google</p>
          </div>
        </Button>
        
        <p className="text-sm text-[#757575]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <div className="max-w-[291px] pb-6">
        <p className="text-xs tracking-[-0.2px] text-black">
          By joining, you agree to SignFlow{" "}
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="[&>button]:hidden flex justify-center items-center text-center pt-5 pb-2 px-4 max-w-[340px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-[#454545] text-xl tracking-[-2%] font-semibold leading-[120%]">
              Welcome to SignFlow!
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-col gap-2 text-[11.75px] text-[#757575]">
                <p>
                  Your account has been created successfully. You can now start using our translation services.
                </p>
              </div>
            </DialogDescription>
            <DialogFooter className="pt-4">
              <Button 
                onClick={() => router.push("/login")}
                className="w-full h-[33px] rounded-[23.5px] bg-[#D4AF37] hover:bg-[#d4af37ef] mb-2"
              >
                Log in to continue
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Register;
