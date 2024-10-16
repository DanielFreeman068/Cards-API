const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use('/public', express.static('./public'));
app.set('view engine', 'ejs');

// Add body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add express-session middleware
app.use(session({
    secret: 'hehe', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', (req, res) => {
    res.render('index');
});

// Blackjack Routes
app.get('/blackjack/start', async (req, res) => {
    try {
        const deckRes = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const deckId = deckRes.data.deck_id;

        const playerDraw = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
        const dealerDraw = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);

        const gameData = {
            deckId: deckId,
            playerHand: playerDraw.data.cards,
            dealerHand: dealerDraw.data.cards,
            playerScore: calculateScore(playerDraw.data.cards),
            dealerScore: calculateScore([dealerDraw.data.cards[0]]),
            gameOver: false,
            message: ''
        };

        req.session.gameData = gameData;
        res.render('blackjack', { gameData });
    } catch (error) {
        res.status(500).send('Error initializing the game');
    }
});

app.post('/blackjack/hit', async (req, res) => {
    try {
        let gameData = req.session.gameData;
        const drawRes = await axios.get(`https://deckofcardsapi.com/api/deck/${gameData.deckId}/draw/?count=1`);
        gameData.playerHand.push(drawRes.data.cards[0]);
        gameData.playerScore = calculateScore(gameData.playerHand);

        if (gameData.playerScore > 21) {
            gameData.gameOver = true;
            gameData.message = 'Player busts! Dealer wins.';
        }

        req.session.gameData = gameData;
        res.json(gameData);
    } catch (error) {
        res.status(500).send('Error during hit');
    }
});

app.post('/blackjack/stand', async (req, res) => {
    try {
        let gameData = req.session.gameData;
        gameData.dealerScore = calculateScore(gameData.dealerHand);

        while (gameData.dealerScore < 17) {
            const drawRes = await axios.get(`https://deckofcardsapi.com/api/deck/${gameData.deckId}/draw/?count=1`);
            gameData.dealerHand.push(drawRes.data.cards[0]);
            gameData.dealerScore = calculateScore(gameData.dealerHand);
        }

        gameData.gameOver = true;

        if (gameData.dealerScore > 21) {
            gameData.message = 'Dealer busts! Player wins.';
        } else if (gameData.dealerScore > gameData.playerScore) {
            gameData.message = 'Dealer wins!';
        } else if (gameData.dealerScore < gameData.playerScore) {
            gameData.message = 'Player wins!';
        } else {
            gameData.message = 'It\'s a tie!';
        }

        req.session.gameData = gameData;
        res.json(gameData);
    } catch (error) {
        res.status(500).send('Error during stand');
    }
});

app.get('/war/start', async (req, res) => {
    try {
        const deckRes = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const deckId = deckRes.data.deck_id;

        const gameData = {
            deckId: deckId,
            playerCards: [],
            cpuCards: [],
            remaining: 52, 
            roundWinner: null,
            gameWinner: null
        };

        req.session.gameData = gameData;
        res.redirect(`/war/${deckId}`);
    } catch (error) {
        res.status(500).send('Error initializing the game');
    }
});

app.get('/war/:deckId', async (req, res) => {
    let gameData = req.session.gameData;

    if (!gameData) {
        return res.redirect('/war/start'); // Redirect to start if gameData is missing
    }

    const deckId = gameData.deckId;

    try {
        // Store previous counts before drawing new cards
        const previousPlayerCardCount = gameData.playerCards.length || 0;
        const previousCpuCardCount = gameData.cpuCards.length || 0;

        // If remaining cards are 0, don't attempt to draw more
        if (gameData.remaining === 0) {
            gameData.gameWinner = determineGameWinner(gameData.playerCards.length, gameData.cpuCards.length);
            req.session.gameData = gameData;
            console.log("Game Over - Winner: " + gameData.gameWinner);
            return res.render('war', {
                gameData,
                previousPlayerCardCount,
                previousCpuCardCount
            });
        }

        // Draw two cards in one request
        const drawResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);

        // Check if the deck returned enough cards; handle if empty
        if (drawResponse.data.cards.length < 2) {
            gameData.gameWinner = determineGameWinner(gameData.playerCards.length, gameData.cpuCards.length);
            req.session.gameData = gameData;
            console.log("Game Over - No more cards to draw.");
            return res.render('war', {
                gameData,
                previousPlayerCardCount,
                previousCpuCardCount
            });
        }

        const playerCard = drawResponse.data.cards[0];
        const cpuCard = drawResponse.data.cards[1];

        // Compare card values to determine the winner
        const playerValue = getCardValue(playerCard.value);
        const cpuValue = getCardValue(cpuCard.value);

        if (playerValue > cpuValue) {
            gameData.roundWinner = 'Player';
            gameData.playerCards.push(playerCard, cpuCard); // Player wins the round
        } else if (cpuValue > playerValue) {
            gameData.roundWinner = 'CPU';
            gameData.cpuCards.push(playerCard, cpuCard); // CPU wins the round
        } else {
            gameData.roundWinner = 'Tie';
            console.log("Tie occurred. Initiating tie-breaker.");
            const tiedCards = [playerCard, cpuCard]; // The initial tied cards
            gameData = await handleTieBreaker(gameData, deckId, tiedCards);        }

        // Decrease remaining card count by 2
        gameData.remaining -= 2;
        console.log(`Remaining Cards: ${gameData.remaining}`);

        // Ensure remaining doesn't go negative
        if (gameData.remaining < 0) {
            gameData.remaining = 0;
        }

        // Check if deck is exhausted
        if (gameData.remaining === 0) {
            gameData.gameWinner = determineGameWinner(gameData.playerCards.length, gameData.cpuCards.length);
            console.log("Game Over - Final Round Completed");
        }

        req.session.gameData = gameData;
        res.render('war', {
            gameData,
            playerCard,
            cpuCard,
            previousPlayerCardCount,
            previousCpuCardCount
        });
    } catch (error) {
        console.log("Error during the game: ", error);
        res.status(500).send('Error during the game');
    }
});

async function handleTieBreaker(gameData, deckId, tiedCards) {
    // Collect all the cards played during the tie
    let warPile = tiedCards || [];

    // Check if there are enough cards to perform the tie-breaker
    if (gameData.remaining < 8) {
        // Not enough cards to continue; determine winner based on current scores
        gameData.gameWinner = determineGameWinner(gameData.playerCards.length, gameData.cpuCards.length);
        console.log("Not enough cards for tie-breaker. Game over.");
        return gameData;
    }

    try {
        // Draw three face-down cards and one face-up card for each player (total of 8 cards)
        const drawResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=8`);

        // Update remaining card count
        gameData.remaining = drawResponse.data.remaining;

        // Cards drawn: first 4 are for the player, next 4 are for the CPU
        const playerCards = drawResponse.data.cards.slice(0, 4);
        const cpuCards = drawResponse.data.cards.slice(4, 8);

        // Add the new cards to the war pile
        warPile.push(...playerCards, ...cpuCards);

        // Get the face-up cards (the fourth card for each)
        const playerFaceUpCard = playerCards[3];
        const cpuFaceUpCard = cpuCards[3];

        // Compare face-up cards
        const playerValue = getCardValue(playerFaceUpCard.value);
        const cpuValue = getCardValue(cpuFaceUpCard.value);

        if (playerValue > cpuValue) {
            gameData.roundWinner = 'Player';
            gameData.playerCards.push(...warPile);
            console.log("Player wins the tie-breaker!");
        } else if (cpuValue > playerValue) {
            gameData.roundWinner = 'CPU';
            gameData.cpuCards.push(...warPile);
            console.log("CPU wins the tie-breaker!");
        } else {
            // It's a tie again; recursively call handleTieBreaker
            console.log("Tie occurred again in tie-breaker. Continuing tie-breaker.");
            return await handleTieBreaker(gameData, deckId, warPile);
        }
    } catch (error) {
        console.log("Error during tie-breaker:", error);
    }

    return gameData;
}


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

// Function to calculate the score for blackjack
function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;

    for (let card of hand) {
        if (card.value === 'ACE') {
            aceCount++;
            score += 11;
        } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
