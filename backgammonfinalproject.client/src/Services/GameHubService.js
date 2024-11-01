import SignalRService from './SignalRService';

class GameHubService {
    // Define hub methods and their parameters
    hubMethods = {
        JoinGame: ['gameId', 'userId'],
        StartGame: ['gameId'],
        RollDice: ['gameId', 'userId'],
        MoveChecker: ['gameId', 'userId', 'from', 'to'],
        SendMessage: ['gameId', 'userId', 'message'],
        OfferDraw: ['gameId', 'userId'],
        RespondToDraw: ['gameId', 'userId', 'accept'],
        ForfeitGame: ['gameId', 'userId']
    };

    // Define events to listen for
    hubEvents = [
        'GameUpdated',
        'MessageReceived',
        'PlayerJoined',
        'GameStarted',
        'DrawOffered',
        'DrawDeclined',
        'DrawAccepted',
        'GameEnded',
        'Error'
    ];

    constructor() {
        // Automatically create methods for all hub calls
        Object.entries(this.hubMethods).forEach(([methodName, params]) => {
            this[methodName.charAt(0).toLowerCase() + methodName.slice(1)] = async (...args) => {
                const processedArgs = args.map((arg, index) => {
                    if (params[index].includes('Id')) return parseInt(arg);
                    if (params[index] === 'from' || params[index] === 'to') return String(arg);
                    return arg;
                });
                await SignalRService.invoke(methodName, ...processedArgs);
            };
        });

        // Automatically create event handlers
        this.hubEvents.forEach(event => {
            this[`on${event}`] = (callback) => {
                SignalRService.on(event, callback);
            };
        });
    }

    removeAllEventListeners() {
        this.hubEvents.forEach(event => {
            SignalRService.off(event);
        });
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

export default new GameHubService();