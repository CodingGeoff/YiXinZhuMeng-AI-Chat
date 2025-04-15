const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });

    try {
        await client.connect();
        const db = client.db("chatDB");
        const collection = db.collection("messages");
        
        const messages = await collection.find()
            .sort({ timestamp: 1 })
            .project({ _id: 0, content: 1, isAI: 1, timestamp: 1 })
            .toArray();

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify(messages)
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    } finally {
        await client.close();
    }
};