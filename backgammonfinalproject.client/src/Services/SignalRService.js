import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.eventHandlers = new Map();
    }

    async connect(gameId, userId) {
        const token = localStorage.getItem('token');
        this.connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7027/gameHub?access_token=${token}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        this.setupEventHandlers();
        await this.connection.start();
        console.log("SignalR Connected.");
        while (this.connection.state !== 'Connected') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        await this.connection.invoke("JoinGame", parseInt(gameId), parseInt(userId));
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            console.log("SignalR Disconnected.");
        }
    }

    async invoke(methodName, ...args) {
        if (!this.connection) {
            throw new Error("SignalR connection not established");
        }
        return await this.connection.invoke(methodName, ...args);
    }
    on(eventName, callback) {
        this.eventHandlers.set(eventName, callback);
    }

    off(eventName) {
        this.eventHandlers.delete(eventName);
    }

    setupEventHandlers() {
        const events = [
            "GameUpdated",
            "MessageReceived",
            "PlayerJoined",
            "Error",
            "GameStarted",
            "GameEnded"
        ];

        events.forEach(event => {
            this.connection.on(event, (data) => {
                const handler = this.eventHandlers.get(event);
                if (handler) {
                    handler(data);
                }
            });
        });
    }
}

export default new SignalRService();