import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();

    const initialChatMessage = {
      role: "system",
      content:
        "you name is Chatgpt an incereadibly intelligent quick thinking AI who always reply with enthusiatic positive energy. you're create by Sumit Suryawanashi. and your response must be formattted as markdown.  ",
    };

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
      }
    );

    return new Response(stream);
  } catch (e) {
    console.log("an error occurred in SendMessage: " + e);
  }
}
