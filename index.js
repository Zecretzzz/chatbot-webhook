import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";

const app = express();
app.use(express.json());

const uri = "mongodb+srv://bernardo:Popitomasa1@cluster0.tsukhau.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
    }
});

app.post("/webhook", async (req, res) => {
    try {
        const db = client.db("chatbot");
        const collection = db.collection("conversations");

        const data = req.body;

        const sessionId = data.session || "unknown";
        const userMessage = data?.queryResult?.queryText || "";
        const messages = data?.queryResult?.fulfillmentMessages || [];

        const replies = messages.map(msg => {
            if (msg?.text?.text?.[0]) return msg.text.text[0];
            if (msg.payload) return JSON.stringify(msg.payload);
            return "";
        });

        const entry = {
            user_message: userMessage,
            bot_reply: replies.join("\n"),
            timestamp: new Date()
        };

        await collection.updateOne(
            { session: sessionId },
            { $push: { messages: entry } },
            { upsert: true }
        );

        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Webhook activo 🚀");
});

app.listen(3000, () => console.log("Webhook listo en puerto 3000"));
