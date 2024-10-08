const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser'); // Add this

const app = express();
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

// Add body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index');
});


app.get('/texas-holdem/start', async (req, res) => {
    try {
        
        const deckRes = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const deckId = deckRes.data.deck_id;
        res.redirect(`/texas-holdem/${deckId}`);
    } catch (error) {
        res.status(500).send('Error initializing the game');
    }
});

app.get('/texas-holdem/:deckId', async (req, res) => {
    const { deckId } = req.params;
    try {
        // Draw 2 cards for each player
        const player1Res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
        const player2Res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);

        // Start with no community cards (pre-flop)
        const gameData = {
            stage: 'pre-flop',
            player1Cards: player1Res.data.cards,
            player2Cards: player2Res.data.cards, // hidden from player
            communityCards: [],
            playerMove: null,
            cpuMove: null,
            deckId: deckId // Pass deckId to the template
        };

        res.render('texas-holdem', { gameData });
    } catch (error) {
        res.status(500).send('Error dealing the cards');
    }
});


app.post('/texas-holdem/:deckId/:stage', async (req, res) => {
    const { deckId, stage } = req.params;
    const { playerMove } = req.body;

    try {
        let gameData = req.session.gameData || {};
        gameData.playerMove = playerMove;

        // CPU Logic - basic decision making for now
        const cpuMove = Math.random() < 0.5 ? 'check' : 'raise'; // random CPU decision
        gameData.cpuMove = cpuMove;

        if (stage === 'pre-flop' && playerMove !== 'fold') {
            // Proceed to the flop stage
            const communityRes = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`);
            gameData.communityCards = communityRes.data.cards;
            gameData.stage = 'flop';
        } else if (stage === 'flop' && playerMove !== 'fold') {
            // Proceed to the turn stage
            const communityRes = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            gameData.communityCards.push(...communityRes.data.cards);
            gameData.stage = 'turn';
        } else if (stage === 'turn' && playerMove !== 'fold') {
            // Proceed to the river stage
            const communityRes = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            gameData.communityCards.push(...communityRes.data.cards);
            gameData.stage = 'river';
        } else if (stage === 'river' && playerMove !== 'fold') {
            // Final showdown - determine winner (simplified for now)
            gameData.stage = 'showdown';
            gameData.winner = determineWinner(gameData.player1Cards, gameData.player2Cards, gameData.communityCards);
        } else {
            gameData.stage = 'end';
        }

        req.session.gameData = gameData;
        res.render('texas-holdem', { gameData });
    } catch (error) {
        console.log(error);  // Add this line to log the error
        res.status(500).send('Error during the game');
    }
});

// Helper function to determine the winner (simplified logic for now)
function determineWinner(player1Cards, player2Cards, communityCards) {
    // Placeholder logic, real poker hand evaluation will be more complex
    return Math.random() < 0.5 ? 'Player 1' : 'CPU'; // random winner for now
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
