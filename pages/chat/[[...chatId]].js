import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { useState } from "react";
import { streamReader } from "openai-edge-stream";

export default function Chatpage() {
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessgaeText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Message:" + messageText);
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
      setIncomingMessage((s) => `${s}${message.content}`);
    });
  };

  return (
    <>
      {" "}
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="  grid h-screen grid-cols-[260px_1fr]">
        <div className="bg-white text-black">
          <div>
            <ChatSidebar />
          </div>
        </div>
        <div className="bg flex flex-col bg-gray-700 ">
          <div className="flex-1 text-white">{incomingMessage}</div>
          <div className="bg-gray-800 p-10 text-start">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessgaeText(e.target.value)}
                  className="w-full resize-none rounded-md bg-gray-700 p-2  text-white  focus:border-emerald-500  focus:outline focus:outline-emerald-500"
                  placeholder="Send a messgae..."
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
