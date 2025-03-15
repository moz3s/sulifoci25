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

app.get('/api/meccsek', async (req, res) => {
    try {
        const firstDate = await db.raw(`
            SELECT MIN(date) AS earliest_date FROM "match" WHERE date >= CURRENT_DATE
        `);
        
        const earliestDate = firstDate.rows[0]?.earliest_date;
        console.log("Earliest match date found:", earliestDate);

        if (!earliestDate) {
            console.log("No upcoming matches found.");
            return res.json({ upcomingMatches: [], otherMatches: [] });
        }

        const upcomingMatches = (await db('match')
        .select('*')
        .where('date', earliestDate))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));
    
        const otherMatches = (await db('match')
        .select('*')
        .where('date', '>', earliestDate)
        .orderBy('date'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));     
    
        res.json({ upcomingMatches, otherMatches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});


app.get('/api/tabella', async (req, res) => {
    try {
        const teams_1 = await db.select('osztaly', 'pontszam', 'korosztaly').from('class').where({ korosztaly: 1 }).orderBy('pontszam', 'desc');
        const teams_2 = await db.select('osztaly', 'pontszam', 'korosztaly').from('class').where({ korosztaly: 2 }).orderBy('pontszam', 'desc');
        res.json({ teams_1, teams_2 });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = user;
        next();
    });
}

app.get('/api/protected-data', authenticateToken, async (req, res) => {
    try {
        res.json({ message: "Secure data", user: req.user });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(3000, () => {
    console.log('Server is running...');
});