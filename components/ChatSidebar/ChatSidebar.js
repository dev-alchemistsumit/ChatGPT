import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faNoteSticky,
  // faMessage,
  faArrowRightFromBracket,
  faRightFromBracket,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ChatSidebar = ({ chatId }) => {
  const [chatList, setChatList] = useState([]);

  //getting newly chatList based on the chatId from endpoint getChatList
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
  }, [chatId]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-900 text-white">
      <Link
        href="/chat"
        className="side-menu-item m-2 bg-emerald-700 hover:bg-emerald-600"
      >
        <FontAwesomeIcon icon={faPenToSquare} />
        New Chat
      </Link>
      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`side-menu-item  ${
              chatId === chat._id ? " bg-gray-700 hover:bg-gray-700" : ""
            }`}
          >
            <FontAwesomeIcon icon={faNoteSticky} />
            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/api/auth/logout" className="side-menu-item ">
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        Logout
      </Link>
    </div>
  );
};
