require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Sequelize } = require('sequelize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);

const sequelize = new Sequelize(
    process.env.DEV_DB_NAME,
    process.env.DEV_DB_USER,
    process.env.DEV_DB_PASS,
    {
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        dialect: 'postgres',
    }
);

// test connection
app.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.send('Database connected');
    } catch (err) {
        console.error("Cant connect", err);
        res.status(500).send("DB connection failed");
    }
});

module.exports = app;

