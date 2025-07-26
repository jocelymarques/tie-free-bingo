# **App Name**: Bingo Online

## Core Features:

- Create Bingo Room: Allow users to create a new bingo room with a custom name and unique ID, storing the room details in localStorage.
- List Bingo Rooms: Display a list of all saved bingo rooms with a button to enter each room.
- Add Players and Generate Cards: Enable users to add their names to the current room and generate a unique, random bingo card for each player, storing player and card details in localStorage.
- Highlight Winner: Visually highlight the winning player and allow user to display their card.
- Automatic Card Marking: Automatically mark called numbers on the player's bingo card and highlight the latest called number in the list of called numbers.
- Sorteio (Draw) Control Modal with generative AI tool.: Implement a modal with controls for starting, pausing, and configuring the interval for the automatic number draw, saving the draw status in localStorage. Add logic so the 'draw' action will use reasoning to incorporate (or not) a number in the output to meet the constraints of a normal bingo game. Present a simple interface with minimal interaction, without excessive customization to avoid overwhelming users and make the game accessible to everyone.
- Win Detection and Modal: Automatically identify when a card is completely filled, display a modal for all players with the winner's name, and visually highlight the winning player in the player list. Uses local storage for record keeping.

## Style Guidelines:

- Primary color: #7B86DA (a muted violet, converted from HSL 247, 34%, 67%).
- Background color: #F0F2F9 (a very light violet, converted from HSL 247, 33%, 96%).
- Accent color: #E6796B (a vibrant red-orange, converted from HSL 9, 69%, 66%).
- Body and headline font: 'PT Sans', a humanist sans-serif for a balance of modernity and warmth.
- Use clean, simple icons from Bootstrap Icons for UI elements such as room selection, player management, and draw controls.
- Employ a responsive grid layout using Bootstrap 5 to ensure the game adapts to different screen sizes. Keep UI components to a minimum to avoid cognitive load.
- Implement subtle transitions and animations (e.g., for the display of drawn numbers or highlighting winning cards) to enhance the user experience without being distracting. Do not add excessive movement to minimize distractions.