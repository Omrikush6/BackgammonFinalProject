import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';

class SignalRService {
    constructor() {
        this.connection = null;
        this.eventHandlers = new Map();
        this.connectionPromise = null;
        this.gameId = null;
        this.userId = null;
    }

    async connect(token, gameId, userId) {
        // Prevent multiple simultaneous connection attempts
        if (this.connectionPromise) {
            console.log('Connection in progress, waiting...');
            return this.connectionPromise;
        }

        // If already connected, just return
        if (this.connection?.state === HubConnectionState.Connected) {
            console.log('Already connected to SignalR hub');
            return Promise.resolve();
        }

        this.gameId = gameId;
        this.userId = userId;

        this.connectionPromise = new Promise(async (resolve, reject) => {
            try {
                // Create connection with more robust configuration
                this.connection = new HubConnectionBuilder()
                    .withUrl('https://localhost:7027/gameHub', {
                        accessTokenFactory: () => token
                    })
                    .configureLogging(LogLevel.Information)
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: (retryContext) => {
                            const maxRetryDelay = 30000; // 30 seconds
                            if (retryContext.elapsedMilliseconds < maxRetryDelay) {
                                return 3000; // 3 seconds between retries
                            }
                            return null; // Stop retrying
                        }
                    })
                    .build();

                this.setupEventHandlers();

                // Add connection state change listeners
                this.connection.onclose((error) => {
                    //console.error('Connection closed:', error);
                    this.connectionPromise = null;
                });

                // Start connection with timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 30000)
                );

                await Promise.race([
                    this.connection.start(),
                    timeoutPromise
                ]);

                // Join game after successful connection
                await this.connection.invoke("JoinGame", parseInt(gameId), parseInt(userId));

                console.log("SignalR Connected.");
                resolve();
            } catch (error) {
                console.error('Connection failed:', error);
                this.connectionPromise = null;
                reject(error);
            } finally {
                this.connectionPromise = null;
            }
        });

        return this.connectionPromise;
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log("SignalR Disconnected.");
            } catch (error) {
                console.error('Disconnection error:', error);
            }
            this.connection = null;
        }
    }

    async invoke(methodName, ...args) {
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            throw new Error("SignalR connection not established or not connected");
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
            'GameUpdated',
            'MessageReceived',
            'PlayerJoined',
            'GameStarted',
            'RespondToDraw',
            'DrawOffered',
            'DrawDeclined',
            'DrawAccepted',
            'GameEnded',
            'Error'
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