"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Mic, Plus, SendHorizonal } from "lucide-react";
import Image from "next/image";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";

export const TextInput = () => {
  const [text, setText] = useState("");
  const [rows, setRows] = useState(1);

  // Handle textarea change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Calculate rows based on content (rough estimate)
    const newRows = Math.max(1, Math.ceil(value.length / 50));
    setRows(newRows > 5 ? 5 : newRows); // Limit to 5 rows max
  };

  // Clear text function
  const handleSend = () => {
    console.log("Sending:", text);
    setText("");
    setRows(1);
  };

  return (
    <div className="relative border border-[#1D1C1D21] rounded-lg min-h-[116px] h-fit">
      <div className="flex justify-between items-center gap-2.5 p-1.5 bg-[#F8F8F8] rounded-t-lg">
        <small className="text-[8px] text-[#D4AF37] font-semibold uppercase">
          Translate with Signflow AI
        </small>

        <Select defaultValue="nigeria">
          <SelectTrigger className="w-fit border-none bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="uk"
              className="border-b border-[#B1B1B180] rounded-none"
            >
              <div className="flex items-center gap-1">
                <Image src="/uk.svg" alt="uk" width={15} height={15} />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  BSL
                </small>
              </div>
            </SelectItem>
            <SelectItem
              value="usa"
              className="border-b border-[#B1B1B180] rounded-none"
            >
              <div className="flex items-center gap-1">
                <Image src="/usa.svg" alt="usa" width={15} height={15} />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  ASL
                </small>
              </div>
            </SelectItem>
            <SelectItem value="nigeria" defaultChecked>
              <div className="flex items-center gap-1">
                <Image
                  src="/nigeria.svg"
                  alt="nigeria"
                  width={15}
                  height={15}
                />
                <small className="text-[#101928] text-[8.47px] font-medium">
                  NSL
                </small>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Textarea section */}
      <div className="relative">
        <Textarea
          className="w-full h-full py-2 px-3 rounded-none border-none resize-none outline-none placeholder:text-xs placeholder:text-[#1D1C1D80] bg-white transition-all duration-200"
          placeholder="Type to translate..."
          rows={rows}
          value={text}
          onChange={handleTextChange}
        />
      </div>

      {/* Plus and Mic icons positioned absolutely at the bottom left */}
      <div className="flex justify-between items-center gap-4 p-1.5">
        <div className="flex items-center gap-1">
          <div className="flex justify-center items-center bg-[#1D1C1D0D] size-6 rounded-full p-1 cursor-pointer hover:bg-[#1D1C1D1A] transition-colors">
            <Plus className="size-4 text-[#1D1C1D99]" />
          </div>
          <Mic className="size-4 text-[#1D1C1DB2] cursor-pointer hover:text-[#1D1C1D] transition-colors" />
        </div>
        {text.trim() === "" ? (
          <Button className="h-6 w-[57.84px] rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/90">
            <div className="flex items-center justify-center gap-1">
              <Image src="/audio.svg" alt="audio" width={8.84} height={8.84} />
              <p className="text-[10px] font-medium">Voice</p>
            </div>
          </Button>
        ) : (
          <button
            onClick={handleSend}
            className="flex justify-center items-center rounded-full size-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 p-1 cursor-pointer transition-colors"
          >
            <SendHorizonal className="text-white size-4" />
          </button>
        )}
      </div>
    </div>
  );
};
