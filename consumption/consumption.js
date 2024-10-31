const { multichainRpc } = require('../multichain/multichain');
const express = require('express');
const router = express.Router();

const pushConsumptionData = async (ConsumptionStream, rawData) => {
    try {
        if (!rawData) {
            console.log("No data provided.");
            return { status: 204, message: "No data to push." };
        }

        let data;
        try {
            data = JSON.parse(rawData);
        } catch (error) {
            console.error("Invalid JSON format:", error.message);
            return { status: 400, message: "Invalid JSON format." };
        }

        if (data && data.buyer) {
            const key = data.buyer;

            const result = await multichainRpc("publish", [ConsumptionStream, key, { "json": data }]);
            console.log('Data-JSON:', data);

            console.log('Data successfully published to the stream:', result);

            return { status: 200, message: "Data successfully published", data: result };
        } else {
            console.log("No valid data or 'buyer' is missing.");
            return { status: 400, message: "Invalid data received: 'buyer' is missing." };
        }
    } catch (error) {
        console.error("Error in pushUserData:", error.message);
        return { code: 500, status: false, message: error.message };
    }
}

router.get('/get_consumption_data', async (req, res) => {
    try {
        const consumption_stream = process.env.CONSUMPTION_STREAM;

        const { user_code } = req.query; // Get user_code from query params

        // Fetching stream data from Multichain
        const result = await multichainRpc('liststreamitems', [consumption_stream]);

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

module.exports = {
    pushConsumptionData,
    router
};