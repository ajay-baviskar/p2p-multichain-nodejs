const { multichainRpc } = require('../multichain/multichain');

const pushConsumerData = async (userStream, rawData) => {
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

            const result = await multichainRpc("publish", [userStream, key, { "json": data }]);
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
};


module.exports = {
    pushConsumerData,
};