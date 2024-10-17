$(document).ready(function () {
    const newGameButton = $('#newGameButton');
    const hitButton = $('#hitButton');
    const standButton = $('#standButton');
    const gameOverScreen = $('.game-over');
    const messageElement = $('#message');

    function startNewGame() {
        // Reset UI elements
        $('#playerHand').empty();
        $('#dealerHand').empty();
        $('#playerScore').text('0');
        $('#dealerScore').text('0');
        messageElement.text('');
        gameOverScreen.hide();
        hitButton.prop('disabled', true);
        standButton.prop('disabled', true);

        // Fetch initial game data from the backend
        $.get('/blackjack/start', function (data) {
            console.log('Game Start Data:', JSON.stringify(data, null, 2));  // Check the data structure
            if (data) {
                updateGame(data);
                hitButton.prop('disabled', false);
                standButton.prop('disabled', false);
            } else {
                console.error('No game data received from backend');
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Failed to start the game:', textStatus, errorThrown);
            alert('Error: Could not start the game. Please try again.');
        });
    }

    function updateGame(gameData) {
        console.log('Updating game with data:', JSON.stringify(gameData, null, 2));  // Check the game data

        // Validate and display the player hand
        if (validateHand(gameData.playerHand)) {
            $('#playerHand').empty();
            gameData.playerHand.forEach(card => displayCard(card, '#playerHand'));
        } else {
            console.error('Invalid player hand:', gameData.playerHand);
        }

        // Validate and display the dealer hand
        if (validateHand(gameData.dealerHand)) {
            $('#dealerHand').empty();
            gameData.dealerHand.forEach((card, index) => {
                const isFaceDown = !gameData.gameOver && index > 0;
                displayCard(card, '#dealerHand', isFaceDown);
            });
        } else {
            console.error('Invalid dealer hand:', gameData.dealerHand);
        }

        // Update scores and message
        $('#playerScore').text(gameData.playerScore || '0');
        $('#dealerScore').text(gameData.dealerScore || '0');
        messageElement.text(gameData.message || '');

        // Check if the game is over
        if (gameData.gameOver) {
            hitButton.prop('disabled', true);
            standButton.prop('disabled', true);
            gameOverScreen.show();
        } else {
            gameOverScreen.hide();
        }
    }

    function validateHand(hand) {
        if (typeof hand === 'string') {
            try {
                hand = JSON.parse(hand);
            } catch (e) {
                console.error('Failed to parse hand as JSON:', e);
                return false;
            }
        }
        return Array.isArray(hand) && hand.length > 0;
    }

    function displayCard(card, containerSelector, faceDown = false) {
        if (!card || !card.image) {
            console.error('Invalid card data:', card);
            return;
        }
        const imgSrc = faceDown 
            ? 'https://deckofcardsapi.com/static/img/back.png' 
            : card.image;
        const img = $(`<img src="${imgSrc}" alt="${card.value} of ${card.suit}" class="card">`);

        // Handle image loading errors
        img.on('error', function () {
            console.error('Failed to load card image:', imgSrc);
            $(this).attr('src', 'fallback-image.png');
        });

        $(containerSelector).append(img);
    }

    function hit() {
        $.post('/blackjack/hit', function (data) {
            console.log('Hit Response:', JSON.stringify(data, null, 2));
            updateGame(data);
        }).fail(function () {
            console.error('Failed to hit.');
        });
    }

    function stand() {
        $.post('/blackjack/stand', function (data) {
            console.log('Stand Response:', JSON.stringify(data, null, 2));
            updateGame(data);
        }).fail(function () {
            console.error('Failed to stand.');
        });
    }

    // Event listeners
    newGameButton.click(function (e) {
        e.preventDefault();
        startNewGame();
    });
    hitButton.click(hit);
    standButton.click(stand);

    // Start a new game when the page loads
    startNewGame();
});
