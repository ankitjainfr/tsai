const axios = require('axios');

const TOKEN = '7435621483:AAGRUIjDzAJdKTwAThDbgwQyNJ96WSTm3KI';
const URL = 'https://turboswap2.vercel.app';

axios.get(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${URL}`)
  .then(response => {
    if (response.data.ok) {
      console.log('Webhook set successfully');
    } else {
      console.log('Error setting webhook:', response.data);
    }
  })
  .catch(error => {
    console.error('Error setting webhook:', error);
  });
