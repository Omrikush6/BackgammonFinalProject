import SignalRService from './SignalRService';

class GameLogic {
    constructor() {
        this.resetGameState();
        this.selectedChecker = null;

    }

    resetGameState() {
        this.gameState = {
            id: null,
            gameStatus: 0, // WaitingForPlayers enum
            currentTurn: null,
            winnerId: null,
            startTime: new Date().toISOString(),
            endTime: null,
            players: [],
            messages: [],
            points: Array(24).fill({ playerColor: null, checkers: 0 }),
            barWhite: 0,
            barBlack: 0,
            outsideBarWhite: 0,
            outsideBarBlack: 0,
            diceValues: [0, 0],
            isRolled: false,
        };
    }

    async startGame(gameId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:7027/api/Game/StartGame/${gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to start game: ' + await response.text());
            }

            const startedGameData = await response.json();
            this.initializeGame(startedGameData);

            console.log('Game started:', this.gameState);
            return this.gameState;
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    }

    async joinGame(gameId, userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:7027/api/Game/JoinGame/${gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId })
            });
            if (!response.ok) {
                throw new Error('Failed to join game: ' + await response.text());
            }
            const data = await response.json();
            this.initializeGame(data);
            await SignalRService.connect(token, gameId, userId);
            console.log(this.gameState)
            return this.gameState;
        } catch (error) {
            console.error('Error joining game:', error);
            throw error;
        }
    }

    initializeGame(gameData) {
        if (!gameData) {
            console.error('Game data is undefined');
            return this.gameState;
        }
        debugger;
        this.gameState = {
            id: gameData.id,
            gameStatus: gameData.gameStatus,
            currentTurn: gameData.currentTurn,
            winnerId: gameData.winnerId,
            startTime: gameData.startTime,
            endTime: gameData.endTime,
            players: gameData.players || [],
            messages: gameData.messages || [],
            points: gameData.points || Array(24).fill({ playerColor: null, checkers: 0 }),
            barWhite: gameData.barWhite || 0,
            barBlack: gameData.barBlack || 0,
            outsideBarWhite: gameData.outsideBarWhite || 0,
            outsideBarBlack: gameData.outsideBarBlack || 0,
            diceValues: gameData.diceValues || [0, 0],
            isRolled: gameData.isRolled || false
        };

        return this.gameState;
    }

    updateGameState() {
        SignalRService.updateGameState(this.getGameStateForUpdate());
        if (this.gameState.gameStatus === 3) {
            SignalRService.notifyGameEnd(this.gameState.id, this.gameState.winnerId);
        }
        console.log(this.gameState)
    }

    getGameStateForUpdate() {
        return {
            id: this.gameState.id,
            gameStatus: this.gameState.gameStatus,
            currentTurn: this.gameState.currentTurn,
            winnerId: this.gameState.winnerId,
            startTime: this.gameState.startTime,
            endTime: this.gameState.endTime,
            players: this.gameState.players,
            messages: this.gameState.messages.map(message => ({
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                senderId: message.senderId,
                senderName: message.senderName
            })),
            points: JSON.stringify(this.gameState.points),
            barWhite: this.gameState.barWhite,
            barBlack: this.gameState.barBlack,
            outsideBarWhite: this.gameState.outsideBarWhite,
            outsideBarBlack: this.gameState.outsideBarBlack,
            diceValues: this.gameState.diceValues,
            isRolled: this.gameState.isRolled
        };
    }

    rollDice(userId) {
        // Check if it's the player's turn
        if (this.gameState.currentTurn != userId) {
            return { success: false, message: "It's not your turn", diceValues: this.gameState.diceValues };
        }
    
        // Check if dice have already been rolled
        if (this.gameState.isRolled) {
            return { success: false, message: "Dice already rolled", diceValues: this.gameState.diceValues };
        }

        if (this.gameState.gameStatus != 2) { // Game has is not in progress 
            return { success: false, message: 'The game is not in progress' };
        }
    
        // Roll the dice
        const diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        this.gameState.diceValues = diceValues;
    
        // Handle doubles (duplicate dice)
        if (diceValues[0] === diceValues[1]) {
            this.gameState.diceValues = [...diceValues, ...diceValues]; // Double the dice values
        }
    
        // Check if the player can make a valid move from the bar
        const movingColor = this.gameState.currentTurn === this.gameState.players.white.id ? 'white' : 'black';
        if (!this.checkForPossibleMovesFromBar(movingColor)) {
            console.log('No possible moves from the bar, ending turn.');
            this.endTurn(); // End turn automatically if no valid moves are possible
            return { success: true, message: "No valid moves from the bar, turn skipped", diceValues: this.gameState.diceValues };
        }
    
        // Set the isRolled flag to true and update game state
        this.gameState.isRolled = true;
        this.updateGameState();
        
        return { success: true, message: "Dice rolled successfully", diceValues: this.gameState.diceValues };
    }

    checkForPossibleMovesFromBar(movingColor) {
        const barKey = movingColor === 'white' ? 'barWhite' : 'barBlack';
        const hasCheckersOnBar = this.gameState[barKey] > 0;
    
        if (hasCheckersOnBar) {
            for (let diceValue of this.gameState.diceValues) {
                // Calculate target point for bar move based on dice
                const targetPoint = movingColor === 'white' ? diceValue - 1 : 24 - diceValue;
                
                // Check if the move is valid
                const toPoint = this.gameState.points[targetPoint];
                if (toPoint.player === null || toPoint.player === movingColor || toPoint.checkers === 1) {
                    // There's at least one valid move from the bar
                    return true;
                }
            }
            // No valid moves from bar with current dice
            return false;
        }
    
        // No checkers on the bar
        return true;
    }

    // VALLIDATION METHODS

    isValidMove(from, to, playerId) {
        if (from === to) {
            return { success: false, message: 'Cannot move to the same position' };
        }

        if (this.gameState.currentTurn !== playerId) {
            return { success: false, message: 'It\'s not your turn' };
        }

        if (this.gameState.gameStatus != 2) { // Game has is not in progress 
            return { success: false, message: 'The game is not in progress' };
        }

        const isFromBar = from === 'barWhite' || from === 'barBlack';
        const isBearingOff = to === 'outsideWhite' || to === 'outsideBlack';
        const movingColor = isFromBar ? (from.toLowerCase().includes('white') ? 'white' : 'black') : this.gameState.points[from]?.player;
        const playerColor = this.getPlayerColor(playerId);

        if (movingColor !== playerColor) {
            return { success: false, message: 'Cannot move opponent\'s checkers' };
        }

        if (!movingColor) {
            return { success: false, message: 'No checker to move from the specified point' };
        }

        const barKey = `bar${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}`;
        if (this.gameState[barKey] > 0 && from !== barKey) {
            return { success: false, message: 'Must move checkers from the bar first' };
        }

        if (isFromBar && typeof to === 'number') {
            return this.isValidMoveFromBar(from, to, movingColor);
        } else if (typeof from === 'number' && typeof to === 'number') {
            return this.isValidMoveBetweenPoints(from, to, movingColor);
        } else if (typeof from === 'number' && isBearingOff) {
            return this.isValidBearOff(from, to, movingColor);
        }


        return { success: false, message: 'Invalid move' };
    }

    isValidMoveFromBar(from, to, movingColor) {
        const isValidQuadrant = movingColor === 'white' ? to <= 5 : to >= 18;
        if (!isValidQuadrant) {
            return { success: false, message: 'Invalid move from bar: wrong quadrant' };
        }

        const destPoint = this.gameState.points[to];
        if (destPoint.player !== movingColor && destPoint.checkers > 1) {
            return { success: false, message: 'Invalid move from bar: destination occupied by opponent' };
        }

        const moveDistance = movingColor === 'white' ? to + 1 : 24 - to;
        if (!this.gameState.diceValues.includes(moveDistance)) {
            return { success: false, message: 'Invalid move from bar: does not match dice value' };
        }

        return { success: true, message: 'Valid move from bar' };
    }

    isValidMoveBetweenPoints(from, to, movingColor) {
        const isValidDirection = movingColor === 'white' ? to > from : to < from;
        if (!isValidDirection) {
            return { success: false, message: 'Invalid move: wrong direction' };
        }

        const destPoint = this.gameState.points[to];
        if (destPoint.player !== movingColor && destPoint.checkers > 1) {
            return { success: false, message: 'Invalid move: destination occupied by opponent' };
        }

        const moveDistance = Math.abs(to - from);
        if (!this.canUseDiceForMove(moveDistance)) {
            return { success: false, message: 'Invalid move: does not match any dice combination' };
        }
        if (!this.gameState.diceValues.includes(moveDistance)) {
            const intermediatePoints = this.getIntermediatePoints(from, to, movingColor);
            const allPointsBlocked = intermediatePoints.every(point => {
                const intermediatePoint = this.gameState.points[point];
                return intermediatePoint.player !== movingColor && intermediatePoint.checkers > 1;
            });
            if (allPointsBlocked) {
                return { success: false, message: 'Invalid move: all intermediate points are blocked' };
            }
        }
        return { success: true, message: 'Valid move between points' };
    }
    canUseDiceForMove(moveDistance) {
        const { diceValues } = this.gameState;
    
        // Helper to check if dice can sum up to the distance
        const canSumToMove = (target, dice) => {
            if (target === 0) return true; // If we exactly matched the distance
            if (dice.length === 0) return false; // No more dice to use
    
            // Try using the first dice value and check the rest recursively
            const [first, ...rest] = dice;
            if (target >= first && canSumToMove(target - first, rest)) {
                return true;
            }
            
            // Skip this dice and try with the rest
            return canSumToMove(target, rest);
        };
    
        if (diceValues.length === 0) {
            return false;
        }
    
        // Check if the move distance can be made with the current diceValues
        const diceSet = diceValues.slice(); // Copy the dice array to manipulate
        return canSumToMove(moveDistance, diceSet);
    }

    isValidBearOff(from, to, movingColor) {
        const homeBoard = movingColor === 'white' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];
        const allInHomeBoard = this.gameState.points.every((point, index) => {
            return (homeBoard.includes(index) || point.player !== movingColor || point.checkers === 0);
        });
        if (!allInHomeBoard) {
            return { success: false, message: "Not all checkers are in the home board" };
        }

        const moveDistance = movingColor === 'white' ? 24 - from : from + 1;
        const highestDice = Math.max(...this.gameState.diceValues);
        if (!this.gameState.diceValues.includes(moveDistance) && 
            !(moveDistance < highestDice && this.isHighestCheckerInHomeBoard(from, movingColor))) {
            return { success: false, message: 'Invalid bear off: does not match dice value' };
        }

        return { success: true, message: 'Valid bear off move' };
    }

    isHighestCheckerInHomeBoard(from, movingColor) {
        const homeBoard = movingColor === 'white' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];
        const higherPoints = movingColor === 'white' ? homeBoard.filter(point => point > from) : homeBoard.filter(point => point < from);
        return higherPoints.every(point => this.gameState.points[point].checkers === 0);
    }

    // MOVEMENT METHODS


    moveChecker(from, to, playerId) {
        const validationResult = this.isValidMove(from, to, playerId);
        if (!validationResult.success) {
            return validationResult;
        }

        const isFromBar = from === 'barWhite' || from === 'barBlack';
        const isBearingOff = to === 'outsideWhite' || to === 'outsideBlack';
        const movingColor = isFromBar ? (from.toLowerCase().includes('white') ? 'white' : 'black') : this.gameState.points[from]?.player;

        if (!movingColor) {
            return { success: false, message: 'No checker to move from the specified point' };
        }

        let moveResult;
        if (isFromBar && typeof to === 'number') {
            moveResult = this.moveFromBarToPoint(from, to, movingColor);
        } else if (typeof from === 'number' && typeof to === 'number') {
            moveResult = this.moveBetweenPoints(from, to, movingColor);
        } else if (typeof from === 'number' && isBearingOff) {
            moveResult = this.bearOff(from, to, movingColor);
        } else {
            return { success: false, message: 'Invalid move type' };
        }

        if (moveResult.success) {
            if(this.checkWinCondition(movingColor)) {
                this.gameState.gameStatus = 3;
                this.gameState.winnerId = this.gameState.players[movingColor].id;
                this.gameState.endTime = new Date().toISOString();

                moveResult.gameEnded = true;
                moveResult.message = `${movingColor} has won the game!`;
            }
            if (!this.checkForPossibleMovesFromBar(movingColor)) {
            console.log('No possible moves from the bar, ending turn.');
            this.endTurn(); // End turn automatically if no valid moves are possible
            moveResult.message += " No valid moves from the bar, turn skipped.";
            moveResult.turnEnded = true;
        }
            this.updateGameState();
        }
        return moveResult;
    }
    
    // Helper method to handle moving from the bar to a board point
    moveFromBarToPoint(from, to, movingColor) {
        const fromBar = from;
        const toPoint = this.gameState.points[to];
        const diceValueUsed = movingColor === 'white' ? to + 1 : 24 - to;
        const diceIndex = this.gameState.diceValues.indexOf(diceValueUsed);
        if (diceIndex === -1) {
            return { success: false, message: 'Invalid move: dice value not available' };
        }

        if (toPoint.player === null || toPoint.player === movingColor) {
            this.gameState[fromBar]--;
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: toPoint.checkers + 1
            };
        } else if (toPoint.player !== movingColor && toPoint.checkers === 1) {
            const opponentBar = movingColor === 'white' ? 'barBlack' : 'barWhite';
            this.gameState[fromBar]--;
            this.gameState[opponentBar]++;
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: 1
            };
        } else {
            return { success: false, message: 'Invalid move from bar to board' };
        }

        this.gameState.diceValues.splice(diceIndex, 1);
        if (this.gameState.diceValues.length === 0) {
            this.endTurn();
        }
        return { success: true, message: 'Moved checker from bar to point' };
    }

    // Helper method to handle moving between points on the board
    moveBetweenPoints(from, to, movingColor) {
        const fromPoint = this.gameState.points[from];
        const toPoint = this.gameState.points[to];
        const opponentBar = movingColor === 'white' ? 'barBlack' : 'barWhite';

        if (fromPoint.checkers <= 0 || fromPoint.player !== movingColor) {
            return { success: false, message: 'No checker to move or wrong color' };
        }

        const moveDistance = Math.abs(to - from);

        const intermediatePoints = this.getIntermediatePoints(from, to, movingColor);
        let captured = false;  // Track if a capture has already occurred

        intermediatePoints.forEach(intermediatePoint => {
            if (!captured && this.gameState.points[intermediatePoint].player !== movingColor && this.gameState.points[intermediatePoint].checkers === 1) {
                this.gameState[opponentBar]++;
                this.gameState.points[intermediatePoint] = {
                    ...intermediatePoint,
                    player: null,
                    checkers: 0
                }
                captured = true;  // Set flag to true after first capture
            }
        });

        if (toPoint.player === null || toPoint.player === movingColor) {
            this.gameState.points[from] = {
                ...fromPoint,
                checkers: fromPoint.checkers - 1,
                player: fromPoint.checkers === 1 ? null : movingColor
            };
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: toPoint.checkers + 1
            };
        } else if (toPoint.player !== movingColor && toPoint.checkers === 1) {
            this.gameState[opponentBar]++;
            this.gameState.points[from] = {
                ...fromPoint,
                checkers: fromPoint.checkers - 1,
                player: fromPoint.checkers === 1 ? null : movingColor
            };
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: 1
            };
        } else {
            return { success: false, message: 'Invalid move between board points' };
        }

        this.removeUsedDiceForMove(moveDistance);
        if (this.gameState.diceValues.length === 0) {
            this.endTurn();
        }
        return { success: true, message: 'Moved checker between points' };
    }

    getIntermediatePoints(from, to, movingColor) {
        const distance = Math.abs(to - from);
        return this.gameState.diceValues
            .map(dieValue => movingColor === 'white' ? from + dieValue : from - dieValue)
            .filter(newPoint => Math.abs(newPoint - from) < distance);
    }

    removeUsedDiceForMove(moveDistance) {
        const diceValues = [...this.gameState.diceValues];
        const isDoubles = diceValues.length === 4 && diceValues.every(v => v === diceValues[0]);
    
        if (isDoubles) {
            const singleDieValue = diceValues[0];
            const usedDiceCount = Math.min(Math.floor(moveDistance / singleDieValue), 4);
            this.gameState.diceValues = diceValues.slice(usedDiceCount);
        } else {
            const remainingDice = diceValues.filter(die => {
                if (die === moveDistance) {
                    moveDistance = 0;
                    return false;
                }
                return true;
            });
    
            this.gameState.diceValues = moveDistance === 0 ? remainingDice : [];
        }
    
        return {
            success: true,
            message: 'Dice values updated after move',
            remainingDice: this.gameState.diceValues
        };
    }

    bearOff(from, to, movingColor) {
        const fromPoint = this.gameState.points[from];
        this.gameState.points[from] = {
            ...fromPoint,
            checkers: fromPoint.checkers - 1,
            player: fromPoint.checkers === 1 ? null : movingColor
        };
        const destination = movingColor === 'white' ? 24 : -1;
        const moveDistance = Math.abs(destination - from);
        this.removeUsedDiceForMove(moveDistance);
        if (movingColor === 'white') {
            this.gameState.outsideBarWhite += 1;
        } else {
            this.gameState.outsideBarBlack += 1;
        }
        if (this.gameState.diceValues.length === 0) {
            this.endTurn();
        }
        return { success: true, message: 'Beared off checker successfully' };
    }
    checkWinCondition(color) {
        const checkersInPlay = this.gameState.points.reduce((total, point) => {
            return total + (point.player === color ? point.checkers : 0);
        }, 0);
        const checkersOnBar = color === 'white' ? this.gameState.barWhite : this.gameState.barBlack;
        return checkersInPlay === 0 && checkersOnBar === 0;
    }

    endTurn() {
        this.gameState.currentTurn =
            this.gameState.currentTurn === this.gameState.players.white.id
                ? this.gameState.players.black.id
                : this.gameState.players.white.id;
    
        // Reset dice values and isRolled flag
        this.gameState.diceValues = [];
        this.gameState.isRolled = false;
    }

    getPlayerColor(playerId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        return player ? player.playercolor : null;
    }
    
    async fetchAllGames() {
        const token = localStorage.getItem('token');
        const response = await fetch('https://localhost:7027/api/Game/AllGames', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          throw new Error(`Error fetching games: ${response.statusText}`);
        }
    
        return await response.json();
    }
}

export default new GameLogic();