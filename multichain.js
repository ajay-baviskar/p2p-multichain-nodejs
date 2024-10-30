// Load environment variables
require('dotenv').config();

const axios = require('axios');
const express = require('express');
const {
    connectToRabbitMQ,
    sendMessageToRabbitMQ,
    consumeQueueData,
    rabbitmqHealthCheck,
    getData
} = require('./rabbitmq'); // Import the RabbitMQ functions

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json()); // This is essential for handling JSON request bodies

// Multichain RPC configuration
const rpcUser = process.env.RPC_USER;
const rpcPassword = process.env.RPC_PASSWORD;
const rpcHost = process.env.RPC_HOST;
const rpcPort = process.env.RPC_PORT;

// Create the base URL for the Multichain JSON-RPC API
const multichainURL = `http://${rpcUser}:${rpcPassword}@${rpcHost}:${rpcPort}`;

// Function to send RPC commands to Multichain
const multichainRpc = async (method, params = []) => {
    const requestData = {
        "method": method,
        "params": params,
        "jsonrpc": "2.0",
        "id": 0,
    };

    try {
        const response = await axios.post(multichainURL, requestData, {
            auth: {
                username: rpcUser,
                password: rpcPassword
            }
        });

        return response.data.result;
    } catch (error) {
        console.error("Error making RPC call:", error.message);
        throw error;
    }
};

// Health check endpoint for RabbitMQ
app.get('/rabbitmq-health', async (req, res) => {
    try {
        const isHealthy = await rabbitmqHealthCheck();
        if (isHealthy) {
            res.json({ code: 200, status: true, message: "RabbitMQ connection is successful" });
        } else {
            res.status(500).json({ code: 500, status: false, message: "RabbitMQ connection failed" });
        }
    } catch (error) {
        res.status(500).json({ code: 500, status: false, message: `RabbitMQ connection error: ${error.message}` });
    }
});

// POST API: Create Stream
app.post('/create_stream', async (req, res) => {
    const { streamName, open } = req.body;

    if (!streamName || typeof open === 'undefined') {
        return res.status(400).json({ message: 'streamName and open are required fields.' });
    }
    console.log(`Creating stream: ${streamName} with open status: ${open}`);

    try {
        const result = await multichainRpc("create", ["stream", streamName, open]);
        console.log("Stream created:", result);

        await multichainRpc("subscribe", [streamName]);

        await sendMessageToRabbitMQ(`Stream '${streamName}' created`);

        res.json({ code: 201, status: true, message: `Stream '${streamName}' created, subscribed, and message sent to RabbitMQ` });
    } catch (error) {
        console.error("Failed to create stream or send message to RabbitMQ:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// GET API: List Streams
app.get('/get_stream_list', async (req, res) => {
    try {
        const result = await multichainRpc("liststreams");
        console.log("stream_list", result);
        res.json({ code: 200, status: true, data: result });
    } catch (error) {
        console.error("Error fetching stream list:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Push user data to the stream
const pushUserData = async () => {
    try {
        const user_stream = 'exampleStream2';

        const rawData = await consumeQueueData(); 

        const data = JSON.parse(rawData);

        if (data && data.buyer) {
            const key = data.buyer;

            const result = await multichainRpc("publish", [user_stream, key, {"json": data}]);

            console.log('Data successfully published to the stream:', result);
        } else {
            console.log("No valid data received from queue or 'buyer' is missing.");
        }
    } catch (error) {
        console.error("Error in pushUserData:", error.message);
    }
};

app.get('/get_user_data', async (req, res) => {
    try {
        const user_stream = 'exampleStream2'; 

        const result = await multichainRpc("liststreamitems", [user_stream]);

        if (result && result.length > 0) {
            res.json({ code: 200, status: true, data: result });
        } else {
            res.status(404).json({ code: 404, status: false, message: 'No data found in the stream' });
        }
    } catch (error) {
        console.error("Error fetching stream data:", error.message);
        res.status(500).json({ code: 500, status: false, message: `Error fetching stream data: ${error.message}` });
    }
});

pushUserData();
getData();

module.exports = {
    multichainRpc
}




