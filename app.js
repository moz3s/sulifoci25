require('dotenv').config();
const express = require('express');
const knex = require('knex');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
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

const secretKey = process.env.JWT_SECRET_KEY;

app.post('/api/login-user', async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ error: "Minden mezőt tölts ki!" });
    }

    try {
        const user = await db.select('id', 'name', 'password')
            .from('users')
            .where({ name })
            .first();

        if (!user) {
            return res.status(400).json({ error: "Helytelen név vagy jelszó!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Helytelen név vagy jelszó!" });
        }

        const token = jwt.sign({ userId: user.id, name: user.name }, secretKey, { expiresIn: "1h" });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.JWT_SECRET_KEY === "production",
            sameSite: "strict",
            maxAge: 3600000
        });

        res.json({ message: "Login successful", name: user.name });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/logout', async (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.json({ message: "Logout successful" });
});

app.get('/api/meccsek', async (req, res) => {
    try {
        const firstDate = await db.raw(`
            SELECT MIN(date) AS earliest_date FROM "match" WHERE date >= CURRENT_DATE
        `);
        
        const earliestDate = firstDate.rows[0]?.earliest_date;

        if (!earliestDate) {
            console.log("No upcoming matches found.");
            return res.json({ upcomingMatches: [], otherMatches: [] });
        }

        const upcomingMatches = (await db('match')
        .select('*')
        .where('date', earliestDate)
        .orderBy('date').orderBy('time'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));

        const otherMatches = (await db('match')
        .select('*')
        .where('date', '>', earliestDate)
        .orderBy('date').orderBy('time'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));

        const prevMatches = (await db('match')
        .select('*')
        .where('date', '<', db.raw('CURRENT_DATE'))
        .orderBy('date').orderBy('time'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));

    
        res.json({ upcomingMatches, otherMatches, prevMatches });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});


app.get('/api/tabella', async (req, res) => {
    try {
        const teams_1 = await db.select('*').from('class').where({ korosztaly: 1 }).orderBy('pontszam', 'desc');
        const teams_2 = await db.select('*').from('class').where({ korosztaly: 2 }).orderBy('pontszam', 'desc');
        res.json({ teams_1, teams_2 });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get('/api/get-teams', async (req, res) => {
    try {
        const teams = await db.select('osztaly').from('class').orderBy('osztaly');
        res.json({ teams });
    } catch (err) {
        console.error('Error fetching data', err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get('/api/get-match-admin', async (req, res) => {
    try {
        const doneMatch = (await db.select('*').from('match').whereNotNull('winner').orderBy('date').orderBy('time'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));
        const unDoneMatch = (await db.select('*').from('match').whereNull('winner').orderBy('date').orderBy('time'))
        .map(match => ({
            ...match,
            date: new Date(match.date).toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' }),
            time: match.time.slice(0, 5)
        }));
        res.json({ doneMatch, unDoneMatch });
    } catch (err) {
        console.error('Error fetching data', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/add-match', async (req, res) => {
    try {
        const { o1, o2, date, time } = req.body;
        if (o1 == o2) {
            return res.status(400).json({ error: "Nem lehet ugyanaz a két csapat!" });
        }

        const kor1 = await db.select('korosztaly').from('class').where({ osztaly: o1 }).first();
        const kor2 = await db.select('korosztaly').from('class').where({ osztaly: o2 }).first();
        if (kor1.korosztaly != kor2.korosztaly) {
            return res.status(400).json({ error: "Azonos korcsoportból válassz!" });
        }

        const newMatch = await db('match')
            .insert({
                o1,
                o2,
                date,
                time
            });
        res.json({ message: "A mérkőzés hozzáadásra került" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/delete-match', authenticateToken, async (req, res) => {
    try {
        const { matchId } = req.body;

        await db.transaction(async (trx) => {
            const match = await trx('match')
                .select('*')
                .where({ id: matchId })
                .forUpdate()
                .first();

            if (!match) {
                return res.status(404).json({ error: "Match not found!" });
            }

            if (match.winner) {
                const isPenalty = match.bunteto === true;
                let winner = match.winner;
                let loser = match.winner === match.o1 ? match.o2 : match.o1;

                if (isPenalty) {
                    await trx('class').where({ osztaly: winner }).decrement('pontszam', 2);
                    await trx('class').where({ osztaly: loser }).decrement('pontszam', 1);
                } else {
                    await trx('class').where({ osztaly: winner }).decrement('pontszam', 3);
                }
            }

            await trx('match').where({ id: matchId }).del();
        });

        res.json({ message: "A mérkőzés törlésre került" });
    } catch (err) {
        console.error("Error deleting match:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.get('/admin', authenticateToken, (req, res) => {
    res.sendFile(__dirname + '/private/admin.html');
});

app.post('/api/select-winner', authenticateToken, async (req, res) => {
    try {
        const { matchId, winner, bunteto } = req.body;

        await db.transaction(async (trx) => {
            const match = await trx('match')
                .select('o1', 'o2', 'winner')
                .where({ id: matchId })
                .forUpdate()
                .first();

            if (!match) {
                return res.status(404).json({ error: "Match not found!" });
            }

            if (match.winner) {
                return res.status(400).json({ error: "Winner has already been selected for this match!" });
            }

            let winningTeam, losingTeam;
            if (winner == 1) {
                winningTeam = match.o1;
                losingTeam = match.o2;
            } else if (winner == 2) {
                winningTeam = match.o2;
                losingTeam = match.o1;
            } else {
                return res.status(400).json({ error: "Helytelen győztes választás!" });
            }

            await trx('match').where({ id: matchId }).update({ winner: winningTeam });

            if (!bunteto) {
                await trx('class')
                    .where({ osztaly: winningTeam })
                    .increment('pontszam', 3);

                await trx('match')
                    .where({ id: matchId })
                    .update({ bunteto: false });
            } else {
                await trx('class')
                    .where({ osztaly: winningTeam })
                    .increment('pontszam', 2);

                await trx('class')
                    .where({ osztaly: losingTeam })
                    .increment('pontszam', 1);

                await trx('match')
                    .where({ id: matchId })
                    .update({ bunteto: true });
            }
        });

        res.json({ message: "A győztes kiválasztásra került" });
    } catch (err) {
        console.error("Error selecting winner:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.post('/api/reset-match', authenticateToken, async (req, res) => {
    try {
        const { matchId } = req.body;

        const match = await db.select('*').from('match').where({ id: matchId }).first();
        if (!match) {
            return res.status(404).json({ error: "Match not found!" });
        }
        const isPenalty = match.bunteto === true;

        let winner, loser;
        if (match.winner === match.o1) {
            winner = match.o1;
            loser = match.o2;
        } else if (match.winner === match.o2) {
            winner = match.o2;
            loser = match.o1;
        } else {
            return res.status(400).json({ error: "No winner recorded for this match!" });
        }

        if (isPenalty) {
            await db('class').where({ osztaly: winner }).decrement('pontszam', 2);
            await db('class').where({ osztaly: loser }).decrement('pontszam', 1);
        } else {
            await db('class').where({ osztaly: winner }).decrement('pontszam', 3);
        }

        await db('match').where({ id: matchId }).update({ winner: null, bunteto: false });

        res.json({ message: "A mérkőzés visszaállításra került" });
    } catch (err) {
        console.error("Error resetting match:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/login', (req, res) => {
    const token = req.cookies.auth_token;
    if (token) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'private', 'login.html'));
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