const express = require('express');
const knex = require('knex');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'psqlDataBase',
        database: 'sulifoci25'
    }
});

const app = express();
let initialPath = path.join(__dirname, 'public');

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(initialPath));

const secretKey = crypto.randomBytes(32).toString('hex');

app.get('/api/tabella', async (req, res) => {
    try {
        const teams_1 = await db.select('osztaly', 'pontszam', 'korosztaly').from('class').where({ korosztaly: 1 }).orderBy('pontszam', 'desc');
        const teams_2 = await db.select('osztaly', 'pontszam', 'korosztaly').from('class').where({ korosztaly: 2 }).orderBy('pontszam', 'desc');
        res.json({ teams_1, teams_2 });
    } catch (error) {
        console.log('Error fetching data:', error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(3000, () => {
    console.log('Server is running...');
});