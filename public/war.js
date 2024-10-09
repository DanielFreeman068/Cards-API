$(document).ready(function() {
    console.log("war.js is working!"); // Debugging log

    // Move cards onto the screen after a short delay
    setTimeout(function() {
        $("#player-card").addClass("player-move");
        $("#cpu-card").addClass("cpu-move");
    }, 500);  // Set to 500ms
});
