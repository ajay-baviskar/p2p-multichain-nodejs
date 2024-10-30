// rabbitmq.js

const amqp = require('amqplib'); // Import RabbitMQ client library
require('dotenv').config(); // Load environment variables
const { multichainRpc } = require('./multichain/multichain');
// RabbitMQ configuration
const MQ_HOST_URL = process.env.MQ_HOST_URL;
const MQ_PORT = process.env.MQ_PORT;
const MQ_USERNAME = process.env.MQ_USERNAME;
const MQ_PASSWORD = process.env.MQ_PASSWORD;
const MQ_VIRTUAL_HOST = process.env.MQ_VIRTUAL_HOST;
const MQ_PROTOCOL = process.env.MQ_PROTOCOL;
const QUEUE_NAME = 'ticker_bc_trade';

let channel;

// Function to connect to RabbitMQ
const connectToRabbitMQ = async () => {
    try {
        const rabbitmqUrl = `${MQ_PROTOCOL}://${MQ_USERNAME}:${MQ_PASSWORD}@${MQ_HOST_URL}:${MQ_PORT}${MQ_VIRTUAL_HOST}`;
        const connection = await amqp.connect(rabbitmqUrl);
        console.log("Connected to RabbitMQ successfully!");

        // Create a channel
        channel = await connection.createChannel();
        console.log("RabbitMQ channel created!");

        // Ensure the queue exists
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`Queue '${QUEUE_NAME}' is ready.`);
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error.message);
        throw error;
    }
};

// Function to send messages to RabbitMQ
const sendMessageToRabbitMQ = async (message) => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); // Ensure channel is initialized
        }
        // Send message to the queue
        channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
        console.log("Message sent to RabbitMQ:", message);
    } catch (error) {
        console.error("Error sending message to RabbitMQ:", error.message);
    }
};

// Function to consume a message from the RabbitMQ queue
const consumeQueueData = async () => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); // Ensure channel is initialized
        }

        // Consume a single message from the queue
        const msg = await channel.get(QUEUE_NAME, { noAck: false });

        if (msg) {
            const messageContent = msg.content.toString();
            // console.log("Received message from queue:", messageContent);

            // Acknowledge the message after receiving
            // channel.ack(msg);

            return messageContent; // Return the message content
        } else {
            console.log("No messages in the queue.");
            return null;
        }
    } catch (error) {
        console.error("Error consuming queue data:", error.message);
        throw error;
    }
};
// const consumeQueueData = async () => {
//     try {
//         if (!channel) {
//             await connectToRabbitMQ(); // Ensure channel is initialized
//         }

//         // Consume a single message from the queue
//         const msg = await channel.get(QUEUE_NAME, { noAck: false });

//         if (msg) {
//             const messageContent = msg.content.toString();
//             console.log("Received message from queue:", messageContent);

//             // Parse the JSON content
//             const parsedMessage = JSON.parse(messageContent);
            
//             // Fix the nested JSON fields
//             if (parsedMessage.seller) {
//                 parsedMessage.seller = JSON.parse(parsedMessage.seller);
//             }
//             if (parsedMessage.buyer) {
//                 parsedMessage.buyer = JSON.parse(parsedMessage.buyer);
//             }

//             // Log the fixed message
//             console.log("Parsed message:", parsedMessage);

//             // Acknowledge the message after receiving
//             // channel.ack(msg);

//             return parsedMessage; // Return the fixed message content
//         } else {
//             console.log("No messages in the queue.");
//             return null;
//         }
//     } catch (error) {
//         console.error("Error consuming queue data:", error.message);
//         throw error;
//     }
// };

// Health check for RabbitMQ connection
const rabbitmqHealthCheck = async () => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); // Ensure channel is initialized
        }
        return true; // If the channel is available, the connection is healthy
    } catch (error) {
        console.error("RabbitMQ health check failed:", error.message);
        return false;
    }
};


const getData = async (req,res) => {
    try {
        const result = await multichainRpc("liststreams");
        console.log("stream_list", result);
        res.json({ code: 200, status: true, data: result });
    } catch (error) {
        console.error("Error fetching stream list:", error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getData,
    connectToRabbitMQ,
    sendMessageToRabbitMQ,
    consumeQueueData,
    rabbitmqHealthCheck,
};
