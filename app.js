require('dotenv').config(); 

const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;


app.use(express.json()); 

const { getData } = require('./rabbitmq/rabbitmq');
const {multichainRpc} = require('./multichain/multichain');
const {callPushConsumerData, callPushUserData,callPushTradeData,callPushSettlementData} = require('./call_rabitmq_data');
const userRoutes = require('./user/users'); 
const consumerRoutes = require('./consumer/consumer'); 
const traderRoutes = require('./trade/trade'); 
const SettlementRoutes = require('./settlement/settlement'); 


app.get('/api/getData', getData);
app.use('/api', userRoutes.router); 
app.use('/api', consumerRoutes.router); 
app.use('/api', traderRoutes.router); 
app.use('/api', SettlementRoutes.router); 


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
    // callPushUserData();
    // callPushConsumerData();
    // callPushTradeData();
    // callPushSettlementData();
// }, 10000); // Adjust the interval as needed (10 seconds here)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
