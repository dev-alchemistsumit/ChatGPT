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

export default function Chatpage({ chatId, title, messages = [] }) {
  console.log("props:", title, messages);
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessgaeText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const router = useRouter();

  //when our route changes
  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  //Lining up new messages to the old ones in view
  //Save the newly streamed meassage to new chat Messages
  useEffect(() => {
    if (!generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage]);

  // if we create new chat
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
      console.log("Message :" + message.event);
      if (message.event === "newChatId") {
        setNewChatId(message.content);
      } else {
        setIncomingMessage((s) => `${s}${message.content}`);
        content = content + message.content;
      }
    });

    setFullMessage(content);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      {" "}
      <Head>
        <title>New Chat</title>
      </Head>
      <div className="  grid h-screen grid-cols-[260px_1fr]">
        <div className="bg-gray-900 text-black">
          <ChatSidebar chatId={chatId} />
        </div>
        <div className="bg flex flex-col overflow-hidden bg-gray-700 ">
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
