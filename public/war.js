let deckId = "";
let playerPile = [];
let computerPile = [];

let lastPlayerCard = null;
let lastComputerCard = null;
let winnerOfLastRound = null;

let warCardsPlayer = [];
let warCardsComputer = [];

// Initialize game and set up event listeners
$(document).ready(function () {
    initializeGame();
    $("#draw-btn").click(handleDraw);
    $("#reset-btn").click(resetGame);
});

// Set up the game with a shuffled deck
function initializeGame() {
    $("#player-card, #computer-card").hide();
    $("#round-result").text("");
    $("#draw-btn").prop("disabled", false);
    $("#reset-btn").hide();
    $("#reset-overlay").hide();

    $.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", function (data) {
        deckId = data.deck_id;

        $.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`, function (data) {
            const cards = data.cards;
            playerPile = cards.slice(0, 26);
            computerPile = cards.slice(26);
            updateScoreDisplay();
        });
    });
}

// Handle drawing a card each round
function handleDraw() {
    $("#draw-btn").prop("disabled", true);
    if ($("#player-card").is(":hidden")) {
        $("#player-card, #computer-card").show();
    }

    lastPlayerCard = playerPile.shift();
    lastComputerCard = computerPile.shift();

    revealCard("#player-card", lastPlayerCard.image, "bottom");
    revealCard("#computer-card", lastComputerCard.image, "top");

    winnerOfLastRound = compareCards(lastPlayerCard, lastComputerCard);

    if (winnerOfLastRound === "player") {
        $("#round-result").text("You win this round!");
        setTimeout(() => {
            playerPile.push(lastPlayerCard, lastComputerCard);
            updateScoreDisplay();
        }, 800);
    } else if (winnerOfLastRound === "computer") {
        $("#round-result").text("Computer wins this round!");
        setTimeout(() => {
            computerPile.push(lastPlayerCard, lastComputerCard);
            updateScoreDisplay();
        }, 800);
    } else {
        $("#round-result").text("WAR! Time for a showdown!");
        $("#draw-btn").prop("disabled", true);
        
        warCardsPlayer = [lastPlayerCard];
        warCardsComputer = [lastComputerCard];

        if (playerPile.length >= 3 && computerPile.length >= 3) {
            setTimeout(function() {
                animateWarCards(0);
            }, 1000);
        } else {
            $("#round-result").text("Not enough cards to continue the war! Game over.");
            $("#draw-btn").prop("disabled", true);
            $("#reset-btn").show();
        }
    }

    setTimeout(() => {
        if (playerPile.length === 0 || computerPile.length === 0) {
            if (playerPile.length === 52) {
                $("#round-result").text("🎉 You win the game!");
            } else if (computerPile.length === 52) {
                $("#round-result").text("💻 Computer wins the game!");
            }
            $("#draw-btn").prop("disabled", true);
            $("#reset-btn").show();
            $("#reset-overlay").show();
        }
    }, 1000);
}

// Animate war sequence with three cards followed by a deciding card
function animateWarCards(cardCount) {
    const cardBackImage = "https://deckofcardsapi.com/static/img/back.png";
    
    if (cardCount < 3) {
        const playerCard = playerPile.shift();
        const computerCard = computerPile.shift();
        
        warCardsPlayer.push(playerCard);
        warCardsComputer.push(computerCard);
        
        revealCard("#player-card", cardBackImage, "bottom");
        revealCard("#computer-card", cardBackImage, "top");
        
        setTimeout(function() {
            animateWarCards(cardCount + 1);
        }, 700);
    } else {
        const finalPlayerCard = playerPile.shift();
        const finalComputerCard = computerPile.shift();
        
        warCardsPlayer.push(finalPlayerCard);
        warCardsComputer.push(finalComputerCard);
        
        revealCard("#player-card", finalPlayerCard.image, "bottom");
        revealCard("#computer-card", finalComputerCard.image, "top");
        
        const warWinner = compareCards(finalPlayerCard, finalComputerCard);
        
        setTimeout(function() {
            if (warWinner === "player") {
                $("#round-result").text("You win the war and take all the cards!");
                playerPile = playerPile.concat(warCardsPlayer, warCardsComputer);
            } else if (warWinner === "computer") {
                $("#round-result").text("Computer wins the war and takes all the cards!");
                computerPile = computerPile.concat(warCardsPlayer, warCardsComputer);
            } else {
                $("#round-result").text("War ended in another tie! Let's fight again.");
                playerPile = playerPile.concat(warCardsPlayer);
                computerPile = computerPile.concat(warCardsComputer);
            }
            
            updateScoreDisplay();
            $("#draw-btn").prop("disabled", false);
        }, 1000);
    }
}

// Compare two card values and return the winner
function compareCards(card1, card2) {
    const values = {
        "2": 2, "3": 3, "4": 4, "5": 5,
        "6": 6, "7": 7, "8": 8, "9": 9,
        "10": 10, "JACK": 11, "QUEEN": 12,
        "KING": 13, "ACE": 14
    };

    const val1 = values[card1.value];
    const val2 = values[card2.value];

    if (val1 > val2) return "player";
    if (val1 < val2) return "computer";
    return "tie";
}

// Update the score display for both players
function updateScoreDisplay() {
    $("#player-score").text(`You: ${playerPile.length} cards`);
    $("#computer-score").text(`Computer: ${computerPile.length} cards`);
    $("#draw-btn").prop("disabled", false);
}

// Reveal a card with a slide and fade-in animation
function revealCard(selector, imageUrl, direction) {
    const $container = $(selector);
    const $img = $container.find("img");

    $img.attr("src", imageUrl);

    $container.css({
        opacity: 0,
        position: "relative",
        top: direction === "top" ? "-100px" : "100px"
    });

    $container.animate({
        top: "0px",
        opacity: 1
    }, 600);
}

// Reset game state and restart
function resetGame() {
    playerPile = [];
    computerPile = [];
    lastPlayerCard = null;
    lastComputerCard = null;
    winnerOfLastRound = null;
    warCardsPlayer = [];
    warCardsComputer = [];

    initializeGame();
}