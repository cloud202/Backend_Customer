const express = require('express');
const app = express();
const cors = require('cors');
const { APP_PORT, DB_LINK } = require('./config');
const connectDB = require('./database');
const customerRoutes = require('./routes/customerRoutes');
const errorHandler = require('./middlewares/errorHandler');

connectDB(DB_LINK);
app.get("/", (req, res) => {
    res.send("<h1 style='text-align:center;padding-top:250px'>Welcome to Cloud202</h1>");
})
app.use(cors());
app.use(express.json());
app.use(customerRoutes);
app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`App is listening on ${APP_PORT}`));