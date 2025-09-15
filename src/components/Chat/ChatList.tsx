"use client";

import React from "react";

export function ChatList() {
  return (
    <div className="h-[72vh] overflow-y-auto p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full" />
        <div>
          <div className="font-semibold">AI Assistant</div>
          <div className="text-sm text-gray-500">Online</div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded self-start max-w-xl">Hello! I'm your AI assistant. How can I help you today?</div>
      <div className="bg-blue-50 p-4 rounded self-end max-w-xl">Hi! I'd like to know more about the voice memo features.</div>
      <div className="bg-gray-100 p-4 rounded self-start max-w-xl">Great question! Voice memos work seamlessly with our chat...</div>
    </div>
  );
}
