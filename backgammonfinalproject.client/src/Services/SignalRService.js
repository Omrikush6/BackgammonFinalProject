import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.onGameUpdated = null;
        this.onMessageReceived = null;
        this.onPlayerJoined = null;
        this.onError = null;
        this.onGameReadyToStart = null;
        this.onGameStarted = null;
    }

    async connect(token, gameId, userId) {
        this.connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7027/gameHub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        this.connection.on("GameUpdated", (updatedGame) => {
            if (this.onGameUpdated) this.onGameUpdated(updatedGame);
        });

        this.connection.on("MessageReceived", (message) => {
            if (this.onMessageReceived) this.onMessageReceived(message);
        });

        this.connection.on("PlayerJoined", (updatedGame) => {
            if (this.onPlayerJoined) this.onPlayerJoined(updatedGame);
        });

        this.connection.on("JoinGameError", (errorMessage) => {
            if (this.onError) this.onError(errorMessage);
        });

        this.connection.on("GameStarted", (updatedGame) => { // New
            if (this.onGameStarted) this.onGameStarted(updatedGame);
        });

        await this.connection.start();
        console.log("SignalR Connected.");

        await this.connection.invoke("JoinGame", parseInt(gameId), parseInt(userId));
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            console.log("SignalR Disconnected.");
        }
    }

    async StartGame(gameId) {
        if (!this.connection) {
            throw new Error("SignalR connection not established");
        }
        await this.connection.invoke("StartGame", parseInt(gameId));
    }

    async sendMessage(gameId, userId, message) {
        if (!this.connection) {
            throw new Error("SignalR connection not established");
        }
        await this.connection.invoke("SendMessage", parseInt(gameId), parseInt(userId), message);
    }

    async updateGameState(gameState) {
        if (!this.connection) {
            throw new Error("SignalR connection not established");
        }   
        await this.connection.invoke("UpdateGame",parseInt(gameState.id), gameState);
    }

    setOnGameReadyToStart(callback) { // New
        this.onGameReadyToStart = callback;
    }

    // New setter for GameStarted event
    setOnGameStarted(callback) { // New
        this.onGameStarted = callback;
    }

    setOnGameUpdated(callback) {
        this.onGameUpdated = callback;
    }

    setOnMessageReceived(callback) {
        this.onMessageReceived = callback;
    }

    setOnPlayerJoined(callback) {
        this.onPlayerJoined = callback;
    }

    setOnError(callback) {
        this.onError = callback;
    }
}

export default new SignalRService();