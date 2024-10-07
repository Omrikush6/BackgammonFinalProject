import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class GameLogic {
    constructor() {
        this.resetGameState();
        this.connection = null;
        this.onGameStateChange = null;
        this.onMessageReceived = null;
    }

    resetGameState() {
        this.gameState = {
            id: null,
            points: Array(24).fill({ player: null, checkers: 0 }), // Changed to store player and checker count
            barWhite: 0,
            barBlack: 0,
            outsideBarWhite: 0,
            outsideBarBlack: 0,
            diceValues: [0, 0],
            currentTurn: null,
            players: [],
            gameStatus: 'WaitingForPlayers', // Added game status
            messages: []
        };
    }

    async createGame() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://localhost:7027/api/Game/CreateGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to create game');
            }
            const data = await response.json();
            this.initializeGame(data);
            return this.gameState;
        } catch (error) {
            console.error('Error creating game:', error);
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
                throw new Error('Failed to join game' + ' ' + await response.text());
            }
            const data = await response.json();
            this.initializeGame(data);
            await this.setupSignalRConnection(gameId, userId);
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
        points[11] = { player: 1, checkers: 5 };
        points[16] = { player: 1, checkers: 3 };
        points[18] = { player: 1, checkers: 5 };
        points[23] = { player: 2, checkers: 2 };
        points[12] = { player: 2, checkers: 5 };
        points[7] = { player: 2, checkers: 3 };
        points[5] = { player: 2, checkers: 5 };
        return points;
    }

    async setupSignalRConnection(gameId, userId) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No authentication token found.");
        }

        this.connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7027/gameHub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        this.connection.on("GameUpdated", (updatedGame) => {
            this.gameState = this.initializeGame(updatedGame);
            if (this.onGameStateChange) {
                this.onGameStateChange(this.gameState);
            }
        });

        this.connection.on("MessageReceived", (message) => {
            if (this.onMessageReceived) {
                this.onMessageReceived(message);
            }
        });

        this.connection.on("PlayerJoined", (updatedGame) => {
            console.log("PlayerJoined event received", updatedGame);
            this.gameState = this.initializeGame(updatedGame);
            if (this.onGameStateChange) {
                this.onGameStateChange(this.gameState);
            }
        });

        this.connection.on("JoinGameError", (errorMessage) => {
            console.error("JoinGameError received", errorMessage);
            if (this.onError) {
                this.onError(errorMessage);
            }
        });

        await this.connection.start();
        console.log("SignalR Connected.");

        await this.connection.invoke("JoinGame", parseInt(gameId), parseInt(userId));
    }

    setOnError(callback) {
        this.onError = callback;
    }

    // UPDATED: Client-side dice rolling
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
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:7027/api/Game/UpdateGame/${this.gameState.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(this.getGameStateForUpdate())
            });
            if (!response.ok) {
                throw new Error('Failed to update game state');
            }
            const data = await response.json();
            this.gameState = this.initializeGame(data);
            if (this.onGameStateChange) {
                this.onGameStateChange(this.gameState);
            }
            return this.gameState;
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

    setOnGameStateChange(callback) {
        this.onGameStateChange = callback;
    }

    setOnMessageReceived(callback) {
        this.onMessageReceived = callback;
    }

    async sendMessage(gameId, userId, message) {
        if (!this.connection) {
            throw new Error("SignalR connection not established");
        }
        await this.connection.invoke("SendMessage", parseInt(gameId), parseInt(userId), message);
    }

    disconnectSignalR() {
        if (this.connection) {
            return this.connection.stop();
        }
        return Promise.resolve();
    }
}

export default new GameLogic();