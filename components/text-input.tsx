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
import { useState, useRef, useEffect } from "react";

export const TextInput = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeight = 100; // Maximum height in pixels

  // Adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate the new height (capped at maxHeight)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    // Apply the new height
    textarea.style.height = `${newHeight}px`;
    
    // Enable or disable scrolling
    if (newHeight >= maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  };

  // Handle textarea change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
  };

  // Adjust height whenever text changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  // Clear text function
  const handleSend = () => {
    console.log("Sending:", text);
    setText("");
    
    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
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
          ref={textareaRef}
          className="w-full py-2 px-3 rounded-none border-none resize-none outline-none placeholder:text-xs placeholder:text-[#1D1C1D80] bg-white transition-all duration-200 overflow-hidden"
          placeholder="Type to translate..."
          value={text}
          onChange={handleTextChange}
          style={{
            minHeight: "50px", // Minimum height
            height: "auto", // Let it grow
            maxHeight: `${maxHeight}px`, // Maximum height
          }}
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