require('dotenv').config(); 

const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;


console
app.use(express.json()); 

const { getData } = require('./rabbitmq/rabbitmq');
const {multichainRpc} = require('./multichain/multichain');
const {callPushTradeData, callPushUserData} = require('./call_rabitmq_data');


app.get('/api/getData', getData);

app.get('/get_user_data', async (req, res) => {
    try {
        const user_stream = 'exampleStream2'; // Replace with your actual stream name
        const { user_code } = req.query; // Get user_code from query params

        // Fetching stream data from Multichain
        const result = await multichainRpc('liststreamitems', [user_stream]);

        if (!result || result.length === 0) {
            return res.status(404).json({ code: 404, status: false, message: 'No data found in the stream' });
        }

        // Filter by user_code if provided
        let filteredData = result;
        if (user_code) {
            filteredData = result.filter(item => item.keys && item.keys.includes(user_code));
        }

        // Check if filtered data exists
        if (filteredData.length > 0) {
            res.json({ code: 200, status: true, data: filteredData });
        } else {
            res.status(404).json({ code: 404, status: false, message: user_code ? `No data found for user_code: ${user_code}` : 'No data found' });
        }
    } catch (error) {
        console.error('Error fetching stream data:', error.message);
        res.status(500).json({ code: 500, status: false, message: `Error fetching stream data: ${error.message}` });
    }
});



app.post('/create_stream',async (req, res) => {
    const { streamName, open } = req.body;

    if (!streamName || typeof open === 'undefined') {
        return res.status(400).json({ message: 'streamName and open are required fields.' });
    }
    console.log(`Creating stream: ${streamName} with open status: ${open}`);

    try {
        const result = await multichainRpc("create", ["stream", streamName, open]);
        console.log("Stream created:", result);

        await multichainRpc("subscribe", [streamName]);
        // await sendMessageToRabbitMQ(`Stream '${streamName}' created`);

        res.json({ code: 201, status: true, message: `Stream '${streamName}' created, subscribed, and message sent to RabbitMQ` });
    } catch (error) {
        console.error("Failed to create stream or send message to RabbitMQ:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// setInterval(() => {
    callPushUserData();
    callPushTradeData();
// }, 10000); // Adjust the interval as needed (10 seconds here)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
