require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const { createClerkClient, verifyToken } = require('@clerk/backend');
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
console.log('clerkClient keys:', Object.keys(clerkClient));
console.log('clerkClient.verifyToken:', typeof clerkClient.verifyToken);
console.log('verifyToken directly from @clerk/backend:', typeof verifyToken);

