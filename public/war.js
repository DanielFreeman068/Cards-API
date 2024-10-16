$(document).ready(function() {
    console.log("war.js is working!");

    var counter = 3;

    var countdownImages = {
        3: '/public/assets/3.svg',
        2: '/public/assets/2.svg',
        1: '/public/assets/1.svg'
    };
    $('#countdown-image').attr('src', countdownImages[counter]);

    var countdownInterval = setInterval(function() {
        counter--;
        if (counter > 0) {
            $('#countdown-image').attr('src', countdownImages[counter]);
        } else {
            clearInterval(countdownInterval);
            $('#countdown').remove();

            $('.game-container').css('visibility', 'visible');

            // Move cards onto the screen
            $("#player-card").addClass("player-move");
            $("#cpu-card").addClass("cpu-move");

            // Flip cards after 0.5 seconds
            setTimeout(function() {
                $("#player-card").addClass("flipped");
                $("#cpu-card").addClass("flipped");
            }, 500);

            // Tilt cards and enhance the winner after flip animation
            setTimeout(function() {
                // Tilt both cards
                $("#player-card").addClass("tilted");
                $("#cpu-card").addClass("tilted");

                // Add winner class to the winning card
                if (roundWinner === "Player") {
                    $("#player-card").addClass("winner");
                } else if (roundWinner === "CPU") {
                    $("#cpu-card").addClass("winner");
                }
            }, 1100); // 500ms (slide in) + 600ms (flip) = 1100ms

            // Show spinning image behind the winning card after cards have tilted
            setTimeout(function() {
                if (roundWinner === "Player") {
                    $("#player-card-container").append('<div class="spinning-image"></div>');
                } else if (roundWinner === "CPU") {
                    $("#cpu-card-container").append('<div class="spinning-image"></div>');
                }
            }, 1600); // Delay to ensure previous animations have completed
        }
    }, 1000);
});
