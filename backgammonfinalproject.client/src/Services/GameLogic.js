import SignalRService from './SignalRService';

class GameLogic {
    constructor() {
        this.resetGameState();
        this.selectedChecker = null;
    }

    resetGameState() {
        this.gameState = {
            id: null,
            gameStatus: 0, // WaitingForPlayers
            currentTurn: null,
            winnerId: null,
            startTime: new Date().toISOString(),
            endTime: null,
            playerIds: [],
            messages: [],
            points: Array(24).fill({ player: null, checkers: 0 }),
            barWhite: 0,
            barBlack: 0,
            outsideBarWhite: 0,
            outsideBarBlack: 0,
            diceValues: [0, 0],
            isRolled: false
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
                throw new Error('Failed to join game: ' + await response.text());
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
            id: gameData.id,
            gameStatus: gameData.gameStatus,
            currentTurn: gameData.currentTurn,
            winnerId: gameData.winnerId,
            startTime: gameData.startTime,
            endTime: gameData.endTime,
            playerIds: gameData.playerIds || [],
            messages: gameData.messages || [],
            points: gameData.points || this.initializePoints(),
            barWhite: gameData.grayBar?.checkersP1 || 0,
            barBlack: gameData.grayBar?.checkersP2 || 0,
            outsideBarWhite: gameData.outSideBar?.checkersP1 || 0,
            outsideBarBlack: gameData.outSideBar?.checkersP2 || 0,
            diceValues: gameData.diceValues || [0, 0],
            isRolled: gameData.isRolled || false
        };

        if (gameData.currentStateJson) {
            const additionalState = JSON.parse(gameData.currentStateJson);
            Object.assign(this.gameState, additionalState);
        }

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
    
    async startGame() {
        try {
            await SignalRService.startGame();
        } catch (error) {
            console.error('Error starting game:', error);
            throw error;
        }
    }

    selectChecker(pointIndex) {
        if (this.gameState.points[pointIndex].checkers > 0) {
            this.selectedChecker = pointIndex;
            return true;
        }
        return false;
    }

    rollDice() {
        const diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        this.gameState.diceValues = diceValues;
        this.gameState.isRolled = true;
        this.updateGameState();
        return diceValues;
    }

    isValidMove(from, to) {
        // Implement move validation logic here
        return true;
    }

    moveChecker(fromIndex, toIndex) {
        if (this.isValidMove(fromIndex, toIndex)) {
            const fromPoint = this.gameState.points[fromIndex];
            const toPoint = this.gameState.points[toIndex];
    
            this.gameState.points[fromIndex] = {
                ...fromPoint,
                checkers: fromPoint.checkers - 1,
                player: fromPoint.checkers === 1 ? null : fromPoint.player
            };
            this.gameState.points[toIndex] = {
                ...toPoint,
                checkers: toPoint.checkers + 1,
                player: fromPoint.player
            };
    
            console.log(`Moved checker from ${fromIndex} to ${toIndex}`);
            this.updateGameState();

            return true;
        } else {
            console.error('Invalid move');
            return false;
        }
    }    
    
    updateGameState() {
        SignalRService.updateGameState(this.getGameStateForUpdate());
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
            playerIds: this.gameState.playerIds,
            messages: this.gameState.messages.map(message => ({
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                senderId: message.senderId,
                senderName: message.senderName
            })),
            currentStateJson: JSON.stringify({
                points: this.gameState.points,
                barWhite: this.gameState.barWhite,
                barBlack: this.gameState.barBlack,
                outsideBarWhite: this.gameState.outsideBarWhite,
                outsideBarBlack: this.gameState.outsideBarBlack,
                diceValues: this.gameState.diceValues,
                isRolled: this.gameState.isRolled
            })
        };
    }
}

export default new GameLogic();