const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

// Add body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add express-session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', (req, res) => {
    res.render('index');
});

// Start the War game
app.get('/war/start', async (req, res) => {
    try {
        const deckRes = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const deckId = deckRes.data.deck_id;

        const gameData = {
            deckId: deckId,
            playerCards: [],
            cpuCards: [],
            roundWinner: null,
            gameWinner: null
        };

        req.session.gameData = gameData;
        res.redirect(`/war/${deckId}`);
    } catch (error) {
        res.status(500).send('Error initializing the game');
    }
});

// Play a round
app.get('/war/:deckId', async (req, res) => {
    const { deckId } = req.params;
    let gameData = req.session.gameData || {};

    try {
        // Draw one card for both player and CPU
        const playerDraw = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const cpuDraw = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);

        const playerCard = playerDraw.data.cards[0];
        const cpuCard = cpuDraw.data.cards[0];

        // Compare card values to determine the winner
        const playerValue = getCardValue(playerCard.value);
        const cpuValue = getCardValue(cpuCard.value);

        if (playerValue > cpuValue) {
            gameData.roundWinner = 'Player';
            gameData.playerCards.push(playerCard, cpuCard); // Player wins the round, takes both cards
        } else if (cpuValue > playerValue) {
            gameData.roundWinner = 'CPU';
            gameData.cpuCards.push(playerCard, cpuCard); // CPU wins the round, takes both cards
        } else {
            gameData.roundWinner = 'Tie'; // War condition, no cards won this round
        }

        // Check if deck is exhausted
        if (playerDraw.data.remaining === 0) {
            gameData.gameWinner = determineGameWinner(gameData.playerCards.length, gameData.cpuCards.length);
        }

        req.session.gameData = gameData;
        res.render('war', { gameData, playerCard, cpuCard });
    } catch (error) {
        res.status(500).send('Error during the game');
    }
});

// Helper function to get the numeric value of the card
function getCardValue(value) {
    if (value === 'ACE') return 14;
    if (value === 'KING') return 13;
    if (value === 'QUEEN') return 12;
    if (value === 'JACK') return 11;
    return parseInt(value); // Return numeric value for 2-10 cards
}

// Helper function to determine the game winner based on card count
function determineGameWinner(playerCardCount, cpuCardCount) {
    if (playerCardCount > cpuCardCount) return 'Player';
    if (cpuCardCount > playerCardCount) return 'CPU';
    return 'Tie'; // In case of a tie in total card counts
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
