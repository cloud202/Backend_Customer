const dotenv = require('dotenv');
dotenv.config()
module.exports = {
    APP_PORT,
    DB_LINK,
    ADMIN_API_BASE_URL
} = process.env;