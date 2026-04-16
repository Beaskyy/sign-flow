"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api";
import type { TextToSignMessageDetail } from "@/lib/text-to-sign-types";

export function useMessageDetails(messageId: string) {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useQuery({
    queryKey: ["messages", messageId, "details"],
    queryFn: () =>
      apiClient<TextToSignMessageDetail>(
        `/conversations/messages/${messageId}/details`,
        token
      ),
    enabled: !!token && !!messageId,
  });
}
