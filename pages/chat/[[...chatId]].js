import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnUp } from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import { ChatSidebar } from "components/ChatSidebar";
import { useEffect, useState } from "react";
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from "uuid";
import { Message } from "../../components/Message/Message";
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Chatpage({ chatId, title, messages = [] }) {
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // State to control sidebar visibility
  const router = useRouter();

  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setNewChatMessages((prev) => [
      ...prev,
      {
        _id: uuid(),
        role: "user",
        content: messageText,
      },
    ]);

    setMessageText("");
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ chatId, message: messageText }),
    });

    const data = response.body;
    if (!data) {
      console.log("Message:" + "No body found");
      return;
    }

    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
        content = content + message.content;
      }
    });

    setNewChatMessages((prev) => [
      ...prev,
      {
        _id: uuid(),
        role: "assistant",
        content: content,
      },
    ]);

    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="flex h-screen flex-row">
        {/* Left Sidebar Section */}
        <div
          className={` flex flex-row bg-gray-900 text-black ${
            sidebarOpen ? " w-1/6" | "sm-w-2/5" : "w-[0]"
          } transition-width duration-500 ease-in-out`}
        >
          <ChatSidebar chatId={chatId} />
          {/* Floating Close Button */}
          <div className="justify-center">
            <button
              className={`fixed top-2 ${
                sidebarOpen ? "left-76" : "left-0"
              } rounded border border-gray-500 bg-gray-950 px-2 py-2 text-white`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div
          className={`bg flex flex-col overflow-hidden bg-gray-700 ${
            sidebarOpen ? "w-5/6" : "w-full"
          }`}
        >
          <div className="flex-1 overflow-auto text-white">
            {allMessages.map((message) => (
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

          {/* your task : show this div only when there is nothing on the screen i.e chat  else show this below div  */}

          <div className="bg-gray-800 p-10 text-start">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none rounded-md bg-gray-700 p-2  text-white  focus:border-emerald-500  focus:outline focus:outline-emerald-500"
                  placeholder={generatingResponse ? "" : "Message ChatGPT..."}
                />
                <button type="submit" className="btn bg-emerald-700 p-4">
                  <FontAwesomeIcon icon={faArrowTurnUp} className="p-2" />
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChatGpt");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: new ObjectId(chatId),
    });

    return {
      props: {
        chatId,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
