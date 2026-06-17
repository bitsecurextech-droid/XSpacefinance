require('dotenv').config();
const { sendVerificationEmail } = require('./config/email');

sendVerificationEmail('your-email@example.com', 'test-token')
  .then(() => console.log('Done'))
  .catch(console.error);