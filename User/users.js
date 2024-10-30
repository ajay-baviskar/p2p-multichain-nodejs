const { multichainRpc } = require('../multichain/multichain');

// const pushUserData = async () => {
//     try {
//         const user_stream = 'exampleStream2';

//         const rawData = await consumeQueueData(); 

//         const data = JSON.parse(rawData);

//         if (data && data.buyer) {
//             const key = data.buyer;

//             const result = await multichainRpc("publish", [user_stream, key, {"json": data}]);

//             console.log('Data successfully published to the stream:', result);
//         } else {
//             console.log("No valid data received from queue or 'buyer' is missing.");
//         }
//     } catch (error) {
//         console.error("Error in pushUserData:", error.message);
//     }
// };

// app.get('/get_user_data', async (req, res) => {
//     try {
//         const user_stream = 'exampleStream2'; 

//         const result = await multichainRpc("liststreamitems", [user_stream]);

//         if (result && result.length > 0) {
//             res.json({ code: 200, status: true, data: result });
//         } else {
//             res.status(404).json({ code: 404, status: false, message: 'No data found in the stream' });
//         }
//     } catch (error) {
//         console.error("Error fetching stream data:", error.message);
//         res.status(500).json({ code: 500, status: false, message: `Error fetching stream data: ${error.message}` });
//     }
// });


const pushUserData = async (userStream, rawData) => {
    try {
        if (!rawData) {
            console.log("No data provided.");
            return { status: 204, message: "No data to push." };
        }

        // Parse rawData inside a try-catch to handle invalid JSON
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (error) {
            console.error("Invalid JSON format:", error.message);
            return { status: 400, message: "Invalid JSON format." };
        }

        // Check if the data has a 'buyer' key
        if (data && data.buyer) {
            const key = data.buyer;

            // Publish to the Multichain stream
            const result = await multichainRpc("publish", [userStream, key, { "json": data }]);
            console.log('Data-JSON:', data);

            console.log('Data successfully published to the stream:', result);

            // Return success response
            return { status: 200, message: "Data successfully published", data: result };
        } else {
            console.log("No valid data or 'buyer' is missing.");
            return { status: 400, message: "Invalid data received: 'buyer' is missing." };
        }
    } catch (error) {
        console.error("Error in pushUserData:", error.message);
        return { code: 500, status: false, message: error.message };
    }
};


module.exports = {
    pushUserData,

};