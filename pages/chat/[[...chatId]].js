import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from "uuid";
import { Message } from "../../components/Message/Message";
import { useRouter } from "next/router";

export default function Chatpage() {
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessgaeText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });

    setMessgaeText("");
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });
    const data = response.body;
    if (!data) {
      console.log("Message:" + "No body found");
      return;
    }
    const reader = data.getReader();
    await streamReader(reader, (message) => {
      console.log("Message :" + message.event);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
      }
    });
    setGeneratingResponse(false);
  };

  return (
    <>
      {" "}
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="  grid h-screen grid-cols-[260px_1fr]">
        <div className="bg-gray-900 text-black">
          <ChatSidebar />
        </div>
        <div className="bg flex flex-col overflow-hidden bg-gray-700 ">
          <div className="flex-1 overflow-auto text-white">
            {newChatMessages.map((message) => (
              <Message
                key={message._id}
                role={message.role}
                content={message.content}
              />
            ))}
            {!!incomingMessage && (
              <Message role="assistant" content={incomingMessage} />
            )}
          </div>
          <div className="bg-gray-800 p-10 text-start">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessgaeText(e.target.value)}
                  className="w-full resize-none rounded-md bg-gray-700 p-2  text-white  focus:border-emerald-500  focus:outline focus:outline-emerald-500"
                  placeholder={generatingResponse ? "" : "Send a message..."}
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
}
