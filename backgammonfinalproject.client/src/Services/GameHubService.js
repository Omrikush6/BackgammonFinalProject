import SignalRService from './SignalRService';

class GameHubService {

    async joinGame(gameId,userId) {
        await SignalRService.invoke("JoinGame", parseInt(gameId), parseInt(userId));
    }

    async startGame(gameId) {
        await SignalRService.invoke("StartGame", parseInt(gameId));
    }

    async rollDice(gameId, userId) {
        await SignalRService.invoke("RollDice", parseInt(gameId), parseInt(userId));
    }

    async moveChecker(gameId, userId, from, to) {
        debugger;
        alert(from + " " + to);
        await SignalRService.invoke("MoveChecker", parseInt(gameId), parseInt(userId), String(from),String(to));
    }

    async sendMessage(gameId, userId, message) {
        await SignalRService.invoke("SendMessage", parseInt(gameId), parseInt(userId), message);
    }

    async offerDraw(gameId, userId) {
        await SignalRService.invoke("OfferDraw", parseInt(gameId), parseInt(userId));
    }

    async respondToDraw(gameId, userId, accept) {
        await SignalRService.invoke("RespondToDraw", parseInt(gameId), parseInt(userId), accept);
    }

    async forfeitGame(gameId, userId) {
        await SignalRService.invoke("ForfeitGame", parseInt(gameId), parseInt(userId));
    }

    onGameUpdated(callback) {
        SignalRService.on("GameUpdated", callback);
    }

    onMessageReceived(callback) {
        SignalRService.on("MessageReceived", callback);
    }

    onPlayerJoined(callback) {
        SignalRService.on("PlayerJoined", callback);
    }

    onGameStarted(callback) {
        SignalRService.on("GameStarted", callback);
    }

    onGameEnded(callback) {
        SignalRService.on("GameEnded", callback);
    }

    onError(callback) {
        SignalRService.on("Error", callback);
    }

    removeAllEventListeners() {
        ["GameUpdated", "MessageReceived", "PlayerJoined", 
         "GameStarted", "GameEnded", "Error"].forEach(event => {
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