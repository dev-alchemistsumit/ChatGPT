import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

//adding data from the stream to mongodb

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const client = await clientPromise;
    const db = client.db("ChatGpt");
    const { chatId, role, content } = req.body;
    const chat = await db.collection("chats").findOneAndUpdate(
      {
        _id: new ObjectId(chatId),
        userId: user.sub,
      },
      {
        //mongodb code
        $push: {
          messages: {
            role,
            content,
          },
        },
      },
      {
        returnDocument: "after",
      }
    );

    res.status(200).json({
      chat: {
        ...chat.value,
        _id: chat.value._id.toString(),
      },
    });
  } catch (e) {
    res.status(500).json({
      message:
        "an Error occured while adding a message to a Chat:addMessageToChat.js:  ",
    });
  }
}