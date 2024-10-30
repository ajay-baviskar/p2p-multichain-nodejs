const amqp = require('amqplib'); // Import RabbitMQ client library
require('dotenv').config(); // Load environment variables
const { multichainRpc } = require('../multichain/multichain');

// RabbitMQ configuration
const MQ_HOST_URL = process.env.MQ_HOST_URL;
const MQ_PORT = process.env.MQ_PORT;
const MQ_USERNAME = process.env.MQ_USERNAME;
const MQ_PASSWORD = process.env.MQ_PASSWORD;
const MQ_VIRTUAL_HOST = process.env.MQ_VIRTUAL_HOST;
const MQ_PROTOCOL = process.env.MQ_PROTOCOL;
const TRADES_QUEUE = process.env.TRADES_QUEUE;
const USER_QUEUE = process.env.USER_QUEUE;
const CONSUMER_QUEUE = process.env.CONSUMER_QUEUE;

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

        // Ensure all queues exist
        await channel.assertQueue(TRADES_QUEUE, { durable: true });
        console.log(`Queue '${TRADES_QUEUE}' is ready.`);

        await channel.assertQueue(USER_QUEUE, { durable: true });
        console.log(`Queue '${USER_QUEUE}' is ready.`);

        await channel.assertQueue(CONSUMER_QUEUE, { durable: true });
        console.log(`Queue '${CONSUMER_QUEUE}' is ready.`);
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error.message);
        throw error;
    }
};

// Function to send messages to a specific queue
const sendMessageToRabbitMQ = async (queue, message) => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); // Ensure channel is initialized
        }
        // Send message to the specific queue
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        console.log(`Message sent to RabbitMQ queue (${queue}):`, message);
    } catch (error) {
        console.error("Error sending message to RabbitMQ:", error.message);
    }
};

// Function to consume data from a specific queue
const consumeQueueData = async (queue) => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); 
        }

        const msg = await channel.get(queue, { noAck: false });

        if (msg) {
            const messageContent = msg.content.toString();

            // channel.ack(msg); // Uncomment this line if you want to acknowledge the message

            return messageContent; 
        } else {
            console.log(`No messages in the '${queue}' queue.`);
            return null;
        }
    } catch (error) {
        console.error(`Error consuming queue data from '${queue}':`, error.message);
        throw error;
    }
};

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

// Fetch data from Multichain as an example
const getData = async (req, res) => {
    try {
        const result = await multichainRpc("liststreams");
        console.log("stream_list", result);
        res.json({ code: 200, status: true, data: result });
    } catch (error) {
        console.error("Error fetching stream list:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getData,
    connectToRabbitMQ,
    sendMessageToRabbitMQ,
    consumeQueueData,
    rabbitmqHealthCheck,
};
