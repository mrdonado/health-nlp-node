/**
 * Load the configuration from the environment, when available.
 * Set defaults otherwise.
 */
let configuration = {
    beanstalkd: {
        host: process.env.BEANSTALKD_HOST || 'localhost',
        port: process.env.BEANSTALKD_PORT || 11300
    },
    cors: {
        allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200'
    },
    twitter: {
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        accessTokenKey: process.env.ACCESS_TOKEN_KEY,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET
    },
    firebase: {
        config: {
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            databaseURL: process.env.FB_DATABASE_URL,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET,
            messagingSenderId: process.env.FB_MESSAGING_SENDER_ID
        },
        user: {
            email: process.env.FB_EMAIL,
            password: process.env.FB_PASSWORD
        }
    },
    errorLevel: process.env.ERROR_LEVEL || 'trace'
};

module.exports = configuration;