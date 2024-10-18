// Ensure the DOM is fully loaded before attaching event handlers
$(document).ready(function() {
    
    // Handle the "Hit" button click event
    $('#hitButton').click(function() {
        // Send a POST request to the server's /blackjack/hit route
        $.post('/blackjack/hit', function(data) {
            // Update the game state based on the server's response
            updateGame(data);
        });
    });

    // Handle the "Stand" button click event
    $('#standButton').click(function() {
        // Send a POST request to the server's /blackjack/stand route
        $.post('/blackjack/stand', function(data) {
            // Update the game state based on the server's response
            updateGame(data);
        });
    });

    // Handle the "New Game" button click event
    $('#newGameButton').click(function() {
        // Send a GET request to the server's /blackjack/start route to start a new game
        $.get('/blackjack/start', function() {
            // Reload the page to reset the game state
            location.reload();
        });
    });

    // Initially hide the game-over message element
    $('.game-over').hide();

    // Function to update the game state based on the data received from the server
    function updateGame(gameData) {
        // Update the player's score display
        $('#playerScore').text(gameData.playerScore);
        
        // Update the dealer's score display
        $('#dealerScore').text(gameData.dealerScore);

        // Clear and update the player's hand with the received cards
        $('#playerHand').empty();
        gameData.playerHand.forEach(card => {
            $('#playerHand').append(`<img src="${card.image}" alt="${card.value} of ${card.suit}">`);
        });

        // Clear and update the dealer's hand with cards
        $('#dealerHand').empty();
        gameData.dealerHand.forEach((card, index) => {
            // Show the first card or the full hand if the game is over, otherwise hide other cards
            const imgSrc = gameData.gameOver || index === 0 
                ? card.image 
                : 'https://deckofcardsapi.com/static/img/back.png';
            $('#dealerHand').append(`<img src="${imgSrc}" alt="${card.value} of ${card.suit}">`);
        });

        // Display any message received from the server (e.g., "Player wins!")
        $('#message').text(gameData.message);

        // Check if the game is over
        if (gameData.gameOver) {
            // Disable the "Hit" and "Stand" buttons if the game is over
            $('#hitButton, #standButton').prop('disabled', true);
            // Show the game-over message
            $('.game-over').show();
        } else {
            // Hide the game-over message if the game is still ongoing
            $('.game-over').hide();
        }
    }
});