// Existing war.js code
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

            $("#player-card").addClass("player-move");
            $("#cpu-card").addClass("cpu-move");

            setTimeout(function() {
                $("#player-card").addClass("flipped");
                $("#cpu-card").addClass("flipped");
            }, 500);

            setTimeout(function() {
                $("#player-card").addClass("tilted");
                $("#cpu-card").addClass("tilted");

                if (roundWinner === "Player") {
                    $("#player-card").addClass("winner");
                } else if (roundWinner === "CPU") {
                    $("#cpu-card").addClass("winner");
                }
            }, 1100);

            setTimeout(function() {
                if (roundWinner === "Player") {
                    $("#player-card-container").append('<div class="spinning-image"></div>');
                } else if (roundWinner === "CPU") {
                    $("#cpu-card-container").append('<div class="spinning-image"></div>');
                }
            }, 1600);

            // Slide in the score rectangles after approximately 4 seconds
            setTimeout(function() {
                // Show the score rectangles
                $("#player-score-rectangle").addClass("slide-in");
                $("#cpu-score-rectangle").addClass("slide-in");

                // Increment counts slowly
                incrementScoreCounts();
            }, 3500); // Delay to ensure previous animations have completed

        }
    }, 1000);
});

// Function to increment the counts
function incrementScoreCounts() {
    var playerCount = previousPlayerCardCount;
    var cpuCount = previousCpuCardCount;
    var playerFinalCount = playerCardCount;
    var cpuFinalCount = cpuCardCount;

    function incrementPlayerScore() {
        if (playerCount !== playerFinalCount) {
            playerCount += playerCount < playerFinalCount ? 1 : -1;
            $("#player-score-count").text(playerCount);
            setTimeout(incrementPlayerScore, 300); // Adjust delay as needed
        }
    }

    function incrementCpuScore() {
        if (cpuCount !== cpuFinalCount) {
            cpuCount += cpuCount < cpuFinalCount ? 1 : -1;
            $("#cpu-score-count").text(cpuCount);
            setTimeout(incrementCpuScore, 300); // Adjust delay as needed
        }
    }

    incrementPlayerScore();
    incrementCpuScore();
}
