import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar = () => {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch("/api/chat/getChatList", {
        method: "POST",
      });
      const json = await response.json();
      console.log("Chat List" + json);
      setChatList(json?.chats || []);
    };

    loadChatList();
  });

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link href="/chat" className="side-menu-item">
        New Chat
      </Link>
      <div className=" flex-1 overflow-auto bg-gray-950 ">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className="side-menu-item"
          >
            {chat.title}
            <br></br>
          </Link>
        ))}
      </div>
      <Link href="/api/auth/logout" className="side-menu-item ">
        Logout
      </Link>
    </div>
  );
};
