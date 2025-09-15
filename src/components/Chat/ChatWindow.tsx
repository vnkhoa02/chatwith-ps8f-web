"use client";

import React, { useState } from "react";

export default function ChatWindow() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col h-[72vh]">
      <div className="flex-1 overflow-y-auto p-6">
        {/* message list */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 p-4 rounded self-start max-w-xl">Hello! I'm your AI assistant. How can I help you today?</div>
          <div className="bg-blue-50 p-4 rounded self-end max-w-xl">I'd like to know more about the voice memo features.</div>
          <div className="bg-gray-100 p-4 rounded self-start max-w-xl">Great question! Voice memos work seamlessly with our chat...</div>
        </div>
      </div>

      <div className="border-t p-4">
        <form onSubmit={(e) => { e.preventDefault(); setValue(""); }} className="flex gap-2">
          <input className="flex-1 rounded border px-3 py-2" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Type a message..." />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </form>
      </div>
    </div>
  );
}
