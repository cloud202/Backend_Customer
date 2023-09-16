const app = require('express')();
const { APP_PORT, DB_LINK } = require('./config');
const connectDB = require('./database');

connectDB(DB_LINK);
app.listen(APP_PORT, () => console.log(`App is listening on ${APP_PORT}`));