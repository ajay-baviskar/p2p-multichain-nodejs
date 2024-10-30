require('dotenv').config(); 

const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

const TRADES_QUEUE = process.env.TRADES_QUEUE;
const USER_QUEUE = process.env.USER_QUEUE;
console
app.use(express.json()); 

const {
    getData,
    consumeQueueData
} = require('./rabbitmq/rabbitmq');

const {
    multichainRpc,
} = require('./multichain/multichain');

const {
    pushUserData
} = require('./user/users');

app.get('/api/getData', getData);

app.get('/get_user_data', async (req, res) => {
    try {
        const user_stream = 'exampleStream2'; // Replace with your actual stream name

        // Fetching stream data from Multichain
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

const callPushUserData = async () => {
    try {
        const userStream = 'exampleStream2';  // Stream name
        const rawData = await consumeQueueData(TRADES_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM TRADES_QUEUE:',TRADES_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        // Call pushUserData with userStream and rawData
        const result = await pushUserData(userStream, rawData);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};

const callPushTradeData = async () => {
    try {
        const TradeStream = 'exampleStream2';  // Stream name
        const rawData = await consumeQueueData(USER_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM USERS:',USER_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        const result = await pushUserData(TradeStream, rawData);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};
// setInterval(() => {
    callPushUserData();
    callPushTradeData();
// }, 10000); // Adjust the interval as needed (10 seconds here)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
