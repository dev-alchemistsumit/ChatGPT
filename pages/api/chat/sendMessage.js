import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { chatId: chatIdFromParam, message } = await req.json();
    let chatId = chatIdFromParam;

    //an initial prompt you set before conversation with ChatGPT
    const initialChatMessage = {
      role: "system",
      content:
        "you name is ChatGPT an increadibly intelligent quick thinking AI who responses quickly and the response are formattted in Markdown.",
      // who always reply with enthusiatic positive energy. This OpenAI ChatGPT(a language model)is created by Sumit Suryawanashi. and
    };

    let newChatId;
    let chatMessages = [];

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
      const json = await response.json();
      chatMessages = json.chat.messages || [];
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
      chatId = json._id;
      newChatId = json._id;
      chatMessages = json.messages || [];
    }

    //this code helps to secure the context questions(previous)
    //and the limit the chatgpt set us for that
    //is 4096 tokens i.e 16k chars
    // but it is ideal for setting it up for 2k
    const messagesToInclude = [];
    chatMessages.reverse();
    let usedTokens = 0;
    for (let chatMessage of chatMessages) {
      const messageTokens = chatMessage.content.length / 4;
      usedTokens += messageTokens;
      if (usedTokens <= 2000) {
        messagesToInclude.push(chatMessage);
      } else {
        break;
      }
    }

    //cause OpenAi expects messages from old to latest
    messagesToInclude.reverse();

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
          messages: [initialChatMessage, ...messagesToInclude],
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

    // SendMessage.js : Msg streamed from the OpenAI(the full reply)

    return new Response(stream);
  } catch (e) {
    console.log("an error occurred in SendMessage: " + e);
  }
}
