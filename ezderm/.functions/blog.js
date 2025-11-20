const axios = require('axios');

exports.main = async (context, sendResponse) => {
    try {
        const response = await axios.get(`https://api.hubapi.com/cms/v3/blogs/posts?limit=10`, {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_TOKEN}` }
        });
        sendResponse({ body: response.data, statusCode: 200 });
    } catch (error) {
        sendResponse({ body: { error: error.message }, statusCode: 500 });
    }
};