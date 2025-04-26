# Card Games Web Application

Welcome to the Card Games Web Application! This application features two classic card games: **War** and **Blackjack**. You can enjoy playing these games directly in your browser.

## 📸 Preview

![Cards API Screenshot](/public/assets/cards.png)  

## Table of Contents

- [Getting Started](#getting-started)
- [Games](#games)
  - [War](#war)
    - [How to Play War](#how-to-play-war)
    - [Game Logic War](#game-logic-war)
  - [Blackjack](#blackjack)
    - [How to Play Blackjack](#how-to-play-blackjack)
    - [Game Logic Blackjack](#game-logic-blackjack)
- [Development Challenges](#development-challenges)
  - [Session Management and State Persistence](#session-management-and-state-persistence)
  - [Consistency with Deck of Cards API](#consistency-with-deck-of-cards-api)
  - [Implementing Tie-Breaker Logic in War](#implementing-tie-breaker-logic-in-war)
  - [Front-End Synchronization](#front-end-synchronization)
  - [Counter Display Issues](#counter-display-issues)
- [Technologies Used](#technologies-used)

## Getting Started

To run this application locally, follow these steps:

1. **Clone the Repository:**

   `
   git clone https://github.com/yourusername/card-games-app.git`

2. Navigate to the Project Directory:

`cd card-games-app`

3. Install Dependencies:


`npm install`

4. Start the Server:


`npm start`

5. Access the Application:


Open your browser and navigate to http://localhost:5000

# Games

## War

### How to Play War

War is a simple card game played between two players: Player and CPU.

Objective: Win all the cards or have the most cards when the game ends.

Gameplay:

- Start the Game: Click on the "Start War" button on the homepage.
- Rounds:
  - Each round, both players draw the top card from their decks.
  - The cards are revealed simultaneously.
  - The player with the higher card wins the round and takes both cards.
  - In case of a tie, a War occurs.
- War (Tie-Breaker):
  - Each player places three cards face-down and one card face-up.
  - The face-up cards are compared.
  - The player with the higher face-up card wins all the cards played during the War.
  - If the face-up cards tie again, the process repeats.
  - If a player doesn't have enough cards to continue a War, the other player wins.
- Game Over:
  - The game ends when there are no cards left in the deck.
  - The player with the most cards in their pile wins.

### Game Logic War

Deck Initialization:

A standard 52-card deck is shuffled and used for the game.

Round Mechanics:

Cards are drawn using the Deck of Cards API.

The remaining card count is tracked and displayed.

Card Values:

Cards are assigned numeric values for comparison:

- Ace: 14
- King: 13
- Queen: 12
- Jack: 11
- Numbers 2-10: Face value

Tie-Breaker Logic:

When a tie occurs:

- Check if there are enough cards to perform the War (tie-breaker).
- If not, the game ends, and the player with more cards wins.
- If there are enough cards:
  - Each player draws three face-down cards and one face-up card.
  - The face-up cards are compared to determine the winner.
  - All cards played during the War are awarded to the winner.
  - If the face-up cards tie again, the process repeats recursively.

End of Game:

The game concludes when the deck is exhausted.

The winner is the player with the most cards in their pile.

## Blackjack

### How to Play Blackjack

Blackjack is a popular casino card game where the goal is to have a hand value closer to 21 than the dealer without exceeding 21.

Objective: Beat the dealer by having a hand value higher than the dealer's without going over 21.

Gameplay:

- Start the Game: Click on the "Start Blackjack" button on the homepage.
- Initial Deal:
  - You (the player) and the dealer are each dealt two cards.
  - The dealer's first card is shown; the second card is hidden.
- Player's Turn:
  - Hit: Draw another card to increase your hand value.
  - Stand: Keep your current hand and end your turn.
  - You can continue to hit until you choose to stand or your hand value exceeds 21 (bust).
- Dealer's Turn:
  - After you stand, the dealer reveals their hidden card.
  - The dealer must draw cards until their hand value is 17 or higher.
- Determine Winner:
  - If you bust, you lose.
  - If the dealer busts, you win.
  - If neither busts, the hand with the higher value wins.
  - A tie results in a push (no winner).

### Game Logic Blackjack

Card Values:

- Number cards (2-10): Face value.
- Face cards (Jack, Queen, King): 10 points.
- Ace: 1 or 11 points, whichever is more advantageous.

Player Decisions:

Implemented using AJAX calls to the server when the player chooses to hit or stand.

Dealer's Logic:

The dealer follows a fixed set of rules:

- Must draw until the hand value is at least 17.
- Aces are counted as 11 unless it causes the dealer to bust, in which case they are counted as 1.

Determining the Winner:

Hand values are compared after both player and dealer have completed their turns.

The game outcome is displayed to the player.

## Development Challenges

During the development of this application, several challenges were encountered:

### Session Management and State Persistence

Issue: Ensuring that game state (gameData) persisted correctly across different routes and user interactions.

Solution:

- Properly configured express-session middleware to manage session data.
- Ensured that session middleware was initialized before defining routes.
- Avoided reinitializing gameData unnecessarily, preventing session data from being overwritten.

### Consistency with Deck of Cards API

Issue: Discrepancies between the local game state and the deck state managed by the Deck of Cards API.

Solution:

- Consistently used the API's remaining card count to update gameData.remaining.
- Ensured that the deckId used in API calls matched the one stored in the session.

### Implementing Tie-Breaker Logic in War

Issue: Incorporating the tie-breaker logic for War, where ties require additional draws and recursive resolution.

Solution:

- Developed the handleTieBreaker function to manage the tie-breaker process.
- Handled edge cases where there might not be enough cards to perform a tie-breaker.
- Ensured that all cards involved in a tie were properly collected and awarded to the winner.

### Front-End Synchronization

Issue: Keeping the user interface in sync with the game state, especially during tie-breakers and game over scenarios.

Solution:

- Used EJS templates to dynamically render game data.
- Passed necessary variables to the client-side scripts to manage animations and updates.
- Added debugging statements to track variable values and ensure consistency.

### Counter Display Issues

Issue: The card counter displayed incorrect values due to mismatches between the local variable and the API's deck state.

Solution:

- Reverted to using the API's remaining value to reflect the actual state of the deck.
- Added debugging logs to identify where the discrepancies occurred.
- Adjusted the logic to prevent manual changes from conflicting with API data.

## Technologies Used

- Node.js: Server-side JavaScript runtime.
- Express.js: Web framework for building the server and handling routes.
- EJS: Templating engine for generating HTML pages with embedded JavaScript.
- Axios: Promise-based HTTP client for making API requests to the Deck of Cards API.
- Deck of Cards API: External API used to simulate a deck of cards and perform draw operations.
- Express-Session: Middleware for managing user sessions and storing game state.
- JavaScript (ES6): Language used for server-side and client-side scripting.
- HTML5 & CSS3: Markup and styling for the web pages.
- jQuery: JavaScript library for DOM manipulation and event handling.
