import SignalRService from './SignalRService';

class GameLogic {
    constructor() {
        this.resetGameState();
    }

    resetGameState() {
        this.gameState = {
            id: null,
            points: Array(24).fill({ player: null, checkers: 0 }), 
            barWhite: 0,
            barBlack: 0,
            outsideBarWhite: 0,
            outsideBarBlack: 0,
            diceValues: [0, 0],
            currentTurn: null,
            players: [],
            gameStatus: 'WaitingForPlayers', 
            messages: []
        };
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
                throw new Error('Failed to join game' + ' ' + await response.text());
            }
            const data = await response.json();
            this.initializeGame(data);
            await SignalRService.connect(token, gameId, userId);
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

        this.gameState = {
            ...this.gameState,
            id: gameData.id || null,
            gameStatus: gameData.gameState || 'WaitingForPlayers',
            currentTurn: gameData.currentTurn || null,
            diceValues: gameData.dice || [0, 0],
            points: gameData.points || this.initializePoints(),
            barWhite: gameData.grayBar?.checkersP1 || 0,
            barBlack: gameData.grayBar?.checkersP2 || 0,
            outsideBarWhite: gameData.outSideBar?.checkersP1 || 0,
            outsideBarBlack: gameData.outSideBar?.checkersP2 || 0,
            players: gameData.players || [],
            messages: gameData.messages || []
        };
        return this.gameState;
    }

    initializePoints() {
        const points = Array(24).fill({ player: null, checkers: 0 });
        points[0] = { player: 1, checkers: 2 };
        points[5] = { player: 2, checkers: 5 };
        points[7] = { player: 2, checkers: 3 };
        points[11] = { player: 1, checkers: 5 };
        points[12] = { player: 2, checkers: 5 };
        points[16] = { player: 1, checkers: 3 };
        points[18] = { player: 1, checkers: 5 };
        points[23] = { player: 2, checkers: 2 };
        return points;
    }

    rollDice() {
        const diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        this.gameState.diceValues = diceValues;
        this.updateGameState();
        return diceValues;
    }

    // UPDATED: Client-side move validation
    isValidMove(from, to) {
        // Implement move validation logic here
        // This is a placeholder and should be replaced with actual game rules
        return true;
    }

    // UPDATED: Client-side move execution
    moveChecker(from, to) {
        if (this.isValidMove(from, to)) {
            // Update the game state
            // This is a simplified version and should be expanded based on game rules
            const fromPoint = this.gameState.points[from];
            const toPoint = this.gameState.points[to];
            
            fromPoint.checkers--;
            if (fromPoint.checkers === 0) fromPoint.player = null;
            
            toPoint.checkers++;
            toPoint.player = fromPoint.player;

            this.updateGameState();
            return true;
        }
        return false;
    }

    async updateGameState() {
        try {
            await SignalRService.updateGameState(this.getGameStateForUpdate());
        } catch (error) {
            console.error('Error updating game state:', error);
            throw error;
        }
    }

    getGameStateForUpdate() {
        return {
            id: this.gameState.id,
            currentTurn: this.gameState.currentTurn,
            gameState: this.gameState.gameStatus,
            currentStateJson: JSON.stringify(this.gameState)
        };
    }

}

export default new GameLogic();