import type { Metadata } from "next";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Chat with BB-8 | Aditya More",
  description: "Ask BB-8 about Aditya More's projects, skills, and experience.",
};

export default function ChatPage() {
  return <ChatWidget fullPage hideButton />;
}
