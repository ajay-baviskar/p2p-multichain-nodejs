require('dotenv').config(); 

const CONSUMER_QUEUE = process.env.CONSUMER_QUEUE;
const USER_QUEUE = process.env.USER_QUEUE;
const TRADES_QUEUE = process.env.TRADES_QUEUE;
const SETTLEMENT_QUEUE = process.env.SETTLEMENT_QUEUE;
const CONSUMPTION_QUEUE = process.env.CONSUMPTION_QUEUE;

const {getData,consumeQueueData} = require('./rabbitmq/rabbitmq');

const { multichainRpc} = require('./multichain/multichain');

const {pushUserData} = require('./user/users');
const {pushConsumerData} = require('./consumer/consumer');


const callPushUserData = async () => {
    try {
        // const UserStream = USER_QUEUE;  
        const UserStream = process.env.USER_STREAM;

        const rawData = await consumeQueueData(USER_QUEUE); 
        console.log('DATA FROM USERS:',USER_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        const result = await pushUserData(UserStream, rawData);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};

const callPushConsumerData = async () => {
    try {
        const ConsumerStream = process.env.CONSUMER_STREAM;
        const rawData = await consumeQueueData(CONSUMER_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM CONSUMER_QUEUE:',CONSUMER_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        // Call pushUserData with userStream and rawData
        const result = await pushConsumerData(ConsumerStream, rawData);
        console.log('ConsumerStream', ConsumerStream);

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
        const TreadeStream = process.env.TRADES_STREAM;
        const rawData = await consumeQueueData(TRADES_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM TRADES_QUEUE:',TRADES_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        // Call pushUserData with userStream and rawData
        const result = await pushConsumerData(TreadeStream, rawData);
        console.log('TreadeStream', TreadeStream);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};

const callPushSettlementData = async () => {
    try {
        const SettlementStream = process.env.SETTLEMENT_STREAM;
        const rawData = await consumeQueueData(SETTLEMENT_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM SETTLEMENT_QUEUE:',SETTLEMENT_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        // Call pushUserData with userStream and rawData
        const result = await pushConsumerData(SettlementStream, rawData);
        console.log('SettlementStream', SettlementStream);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};


const callPushConsumptionData = async () => {
    try {
        const ConsumptionStream = process.env.CONSUMPTION_STREAM;
        const rawData = await consumeQueueData(CONSUMPTION_QUEUE); // Fetching data from the 'USER_QUEUE'
        console.log('DATA FROM CONSUMPTION_QUEUE:',CONSUMPTION_QUEUE);

        if (!rawData) {
            console.log('No data consumed from the queue.');
            return;
        }

        // Call pushUserData with userStream and rawData
        const result = await pushConsumerData(ConsumptionStream, rawData);
        console.log('ConsumptionStream', ConsumptionStream);

        if (result && result.status) {
            console.log('pushUserData result:', result);
        } else {
            console.log('Failed to push user data:', result.message);
        }
    } catch (error) {
        console.error("Error in calling pushUserData:", error.message);
    }
};
module.exports = {
    callPushUserData,
    callPushTradeData,
    callPushConsumerData,
    callPushSettlementData,
    callPushConsumptionData
};
