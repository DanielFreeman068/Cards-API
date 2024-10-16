$(document).ready(function() {
    $('#hitButton').click(function() {
        $.post('/blackjack/hit', function(data) {
            updateGame(data);
        });
    });

    $('#standButton').click(function() {
        $.post('/blackjack/stand', function(data) {
            updateGame(data);
        });
    });

    function updateGame(gameData) {
        $('#playerScore').text(gameData.playerScore);
        $('#dealerScore').text(gameData.dealerScore);
        
        $('#playerHand').empty();
        gameData.playerHand.forEach(card => {
            $('#playerHand').append(`<img src="${card.image}" alt="${card.value} of ${card.suit}">`);
        });

        $('#dealerHand').empty();
        gameData.dealerHand.forEach((card, index) => {
            const imgSrc = gameData.gameOver || index === 0 ? card.image : 'https://deckofcardsapi.com/static/img/back.png';
            $('#dealerHand').append(`<img src="${imgSrc}" alt="${card.value} of ${card.suit}">`);
        });

        $('#message').text(gameData.message);

        if (gameData.gameOver) {
            $('#hitButton, #standButton').prop('disabled', true);
        }
    }
});