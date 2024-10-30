require('dotenv').config(); 

const CONSUMER_QUEUE = process.env.CONSUMER_QUEUE;
const USER_QUEUE = process.env.USER_QUEUE;
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




module.exports = {
    callPushConsumerData,
    callPushUserData,
};
