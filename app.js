
const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); 

const  {
    getData,
    consumeQueueData
} = require('./rabbitmq/rabbitmq')

const  {
    multichainRpc,
    // pushUserData

} = require('./multichain/multichain')

const  {
    pushUserData
} = require('./User/users')

app.get('/api/getData', getData);
// app.get('/api/push-data', pushUserData);
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
        const userStream = 'exampleStream2';
        const rawData = await consumeQueueData(); 

        const result = await pushUserData(userStream, rawData);
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};

// You can call this function based on your application logic.
// For example, you could call it here or based on some event:
callPushUserData();
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

