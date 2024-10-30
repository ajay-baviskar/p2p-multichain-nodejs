const amqp = require('amqplib'); 
require('dotenv').config(); 
const { multichainRpc } = require('../multichain/multichain');

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
const rabbitmqUrl = `${MQ_PROTOCOL}://${MQ_USERNAME}:${MQ_PASSWORD}@${MQ_HOST_URL}:${MQ_PORT}${MQ_VIRTUAL_HOST}`;

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        console.log("Connected to RabbitMQ successfully!");

        channel = await connection.createChannel();
        console.log("RabbitMQ channel created!");

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

const sendMessageToRabbitMQ = async (queue, message) => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); 
        }
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
        console.log(`Message sent to RabbitMQ queue (${queue}):`, message);
    } catch (error) {
        console.error("Error sending message to RabbitMQ:", error.message);
    }
};

const consumeQueueData = async (queue) => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); 
        }

        const msg = await channel.get(queue, { noAck: false });

        if (msg) {
            const messageContent = msg.content.toString();

            // channel.ack(msg); 

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

const rabbitmqHealthCheck = async () => {
    try {
        if (!channel) {
            await connectToRabbitMQ(); 
        }
        return true; 
    } catch (error) {
        console.error("RabbitMQ health check failed:", error.message);
        return false;
    }
};

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
