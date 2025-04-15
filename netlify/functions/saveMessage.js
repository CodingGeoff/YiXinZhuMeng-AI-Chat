const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    });

    try {
        const message = JSON.parse(event.body);
        
        // 数据验证
        if (!message.content || typeof message.isAI !== 'boolean') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid message format" })
            };
        }

        await client.connect();
        const db = client.db("chatDB");
        const collection = db.collection("messages");
        
        const result = await collection.insertOne({
            content: message.content,
            isAI: message.isAI,
            timestamp: new Date(message.timestamp),
            ipAddress: event.headers['client-ip'] || 'unknown'
        });

        return {
            statusCode: 201,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify({ 
                success: true,
                insertedId: result.insertedId 
            })
        };
    } catch (error) {
        console.error('Save error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    } finally {
        await client.close();
    }
};