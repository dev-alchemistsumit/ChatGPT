import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { chatId: chatIdFromParam, message } = await req.json();
    let chatId = chatIdFromParam;

    const initialChatMessage = {
      role: "system",
      content:
        "you name is ChatGPT an increadibly intelligent quick thinking AI who always reply with enthusiatic positive energy. This OpenAI ChatGPT(a language model)is created by Sumit Suryawanashi. and your response must be formattted as Markdown.",
    };

    let newChatId;
    //check if chat exist if Y continue with same one

    if (chatId) {
      //adding msg to already existing chat
      const response = await fetch(
        `${req.headers.get("origin")}/api/chat/addMessageToChat`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({
            chatId,
            role: "user",
            content: message,
          }),
        }
      );
    } else {
      // or else creating new chat
      const response = await fetch(
        `${req.headers.get("origin")}/api/chat/createNewChat`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({ message }),
        }
      );

      const json = await response.json();
      console.log(" NEW CHAT:", json, " from sendMessage.js/53");
      newChatId = json._id;
    }

    //connecting with OpenAI API for Chat
    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initialChatMessage, { content: message, role: "user" }],
          stream: true,
        }),
      },

      {
        //for showing and navigating the ChatId
        onBeforeStream: ({ emit }) => {
          if (newChatId) {
            emit(newChatId, "newChatId");
          }
        },
        //saving data to MongoDB by hitting a endpoint
        onAfterStream: async ({ fullContent }) => {
          await fetch(
            `${req.headers.get("origin")}/api/chat/addMessageToChat`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                cookie: req.headers.get("cookie"),
              },
              body: JSON.stringify({
                chatId,
                role: "assistant",
                content: fullContent,
              }),
            }
          );
        },
      }
    );

    //            "sendMessage.js : Msg streamed from the OpenAI the full reply" +

    return new Response(stream);
  } catch (e) {
    console.log("an error occurred in SendMessage: " + e);
  }
}
