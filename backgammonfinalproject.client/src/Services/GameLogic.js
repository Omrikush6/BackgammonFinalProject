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
            isRolled: false,
            players : {
                white: {id: null},
                black: {id: null}
            }
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
            barWhite: gameData.barWhite || 0,
            barBlack: gameData.barBlack || 0,
            outsideBarWhite: gameData.outSideBar?.checkersP1 || 0,
            outsideBarBlack: gameData.outSideBar?.checkersP2 || 0,
            diceValues: gameData.diceValues || [0, 0],
            isRolled: gameData.isRolled || false,
            players: gameData.players
        };

        if (gameData.currentStateJson) {
            debugger;
            const additionalState = JSON.parse(gameData.currentStateJson);
            Object.assign(this.gameState, additionalState);
            if(this.gameState.players == null) {
                this.initializePlayers();
            }
        }

        return this.gameState;
    }

    initializePlayers() {
        if (this.gameState.playerIds.length !== 2 || !this.gameState.currentTurn) {
            console.error('Not enough information to initialize players');
            return;
        }
        this.gameState.players = {
            white: {
                id: this.gameState.currentTurn
            },
            black: {
                id:this.gameState.currentTurn === this.gameState.playerIds[0] ? this.gameState.playerIds[1] : this.gameState.playerIds[0]
            }
        };
    }

    initializePoints() {    
    const points = Array(24).fill({ player: null, checkers: 0 });
    points[0] = { player: 'white', checkers: 2 };
    points[5] = { player: 'black', checkers: 5 };
    points[7] = { player: 'black', checkers: 3 };
    points[11] = { player: 'white', checkers: 5 };
    points[12] = { player: 'black', checkers: 5 };
    points[16] = { player: 'white', checkers: 3 };
    points[18] = { player: 'white', checkers: 5 };
    points[23] = { player: 'black', checkers: 2 };
    return points;
}
    

    selectChecker(pointIndex) {
        if (this.gameState.points[pointIndex].checkers > 0) {
            this.selectedChecker = pointIndex;
            return true;
        }
        return false;
    }

    rollDice(userId) {

        if (this.gameState.currentTurn != userId) {
            return { success: false, message: "It's not your turn", diceValues: this.gameState.diceValues };
        }

        if (this.gameState.isRolled) {
            return { success: false, message: "Dice already rolled", diceValues: this.gameState.diceValues };
        }
        
        const diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        this.gameState.diceValues = diceValues;
        this.gameState.isRolled = true;
        if (diceValues[0] === diceValues[1]) {
            this.gameState.diceValues = [...diceValues, ...diceValues];
        }
        this.updateGameState();
        return { success: true, message: "Dice rolled successfully", diceValues: this.gameState.diceValues };
    }

    isValidMove(from, to,playerId) {
        /*
        debugger;
        if (from === to) {
            return false;
        }

        if (this.gameState.currentTurn !== playerId) {
            console.error('Invalid move: It\'s not your turn');
            return false;
        }

        const isFromBar = from === 'barWhite' || from === 'barBlack';
        const isBearingOff = to === 'outsideWhite' || to === 'outsideBlack';
        const movingColor = isFromBar ? (from.toLowerCase().includes('white') ? 'white' : 'black') : this.gameState.points[from]?.player;
        const playerColor = this.getPlayerColor(playerId);

        if (movingColor !== playerColor) {
            console.error('Invalid move: Cannot move opponent\'s checkers');
            return false;
        }

        if (!movingColor) {
            console.error('No checker to move from the specified point.');
            return false;
        }
        const barKey = `bar${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}`;
        if (this.gameState[barKey] > 0 && from !== barKey) {
            console.error('Invalid move: Must move checkers from the bar first');
            return false;
        }

        if (isFromBar && typeof to === 'number') {
            return this.isValidMoveFromBar(from, to, movingColor);
        } else if (typeof from === 'number' && typeof to === 'number') {
            return this.isValidMoveBetweenPoints(from, to, movingColor);
        } else if (typeof from === 'number' && isBearingOff) {
            return this.isValidBearOff(from, to, movingColor);
        }

        return false;*/
        return true;
    }

    isValidMoveFromBar(from, to, movingColor) {
        // Check if the move is to the correct starting quadrant
        const isValidQuadrant = movingColor === 'white' ? to <= 5 : to >= 18;
        if (!isValidQuadrant) {
            console.error('Invalid move from bar: wrong quadrant');
            return false;
        }

        // Check if the destination point is available
        const destPoint = this.gameState.points[to];
        if (destPoint.player !== movingColor && destPoint.checkers > 1) {
            console.error('Invalid move from bar: destination occupied by opponent');
            return false;
        }

        // Check if the move matches a dice value
        const moveDistance = movingColor === 'white' ? to + 1 : 24 - to;
        if (!this.gameState.diceValues.includes(moveDistance)) {
            console.error('Invalid move from bar: does not match dice value');
            return false;
        }

        return true;
    }

    isValidMoveBetweenPoints(from, to, movingColor) {
        // Check if the move is in the correct direction
        const isValidDirection = movingColor === 'white' ? to > from : to < from;
        if (!isValidDirection) {
            console.error('Invalid move: wrong direction');
            return false;
        }

        // Check if the destination point is available
        const destPoint = this.gameState.points[to];
        if (destPoint.player !== movingColor && destPoint.checkers > 1) {
            console.error('Invalid move: destination occupied by opponent');
            return false;
        }

        // Check if the move matches a dice value
        const moveDistance = Math.abs(to - from);
        if (!this.gameState.diceValues.includes(moveDistance)) {
            console.error('Invalid move: does not match dice value');
            return false;
        }

        return true;
    }

    isValidBearOff(from, to, movingColor) {
        // Check if all checkers are in the home board
        const homeBoard = movingColor === 'white' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];
        const allCheckersInHome = homeBoard.every(point => 
            this.gameState.points[point].player !== movingColor || this.gameState.points[point].checkers === 0
        );

        if (!allCheckersInHome) {
            console.error('Invalid bear off: not all checkers in home board');
            return false;
        }

        // Check if the move matches a dice value or is a valid higher dice move
        const moveDistance = movingColor === 'white' ? 24 - from : from + 1;
        const highestDice = Math.max(...this.gameState.diceValues);
        if (!this.gameState.diceValues.includes(moveDistance) && 
            !(moveDistance < highestDice && this.isHighestCheckerInHomeBoard(from, movingColor))) {
            console.error('Invalid bear off: does not match dice value');
            return false;
        }

        return true;
    }

    isHighestCheckerInHomeBoard(from, movingColor) {
        const homeBoard = movingColor === 'white' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];
        const higherPoints = movingColor === 'white' ? homeBoard.filter(point => point > from) : homeBoard.filter(point => point < from);
        return higherPoints.every(point => this.gameState.points[point].checkers === 0);
    }



    moveChecker(from, to, playerId) {
        const isFromBar = from === 'barWhite' || from === 'barBlack';
        const isBearingOff = to === 'outsideWhite' || to === 'outsideBlack';
        
        if (this.isValidMove(from, to, playerId)) {
            const movingColor = isFromBar ? (from.toLowerCase().includes('white') ? 'white' : 'black') : this.gameState.points[from]?.player;
    
            if (!movingColor) {
                console.error('No checker to move from the specified point.');
                return false;
            }
    
            // Moving from the bar to a point on the board
            if (isFromBar && typeof to === 'number') {
                return this.moveFromBarToPoint(from, to, movingColor);
            }
            // Moving between points on the board
            else if (typeof from === 'number' && typeof to === 'number') {
                return this.moveBetweenPoints(from, to, movingColor);
            }
            // Moving from a point on the board to the outside bar  
            else if (typeof from === 'number' && isBearingOff) {
                return this.bearOff(from, to, movingColor);
            }
        } else {
            console.error('Invalid move');
            return false;
        }
    }
    
    // Helper method to handle moving from the bar to a board point
    moveFromBarToPoint(from, to, movingColor) {
        const fromBar = from;
        const toPoint = this.gameState.points[to];
    
        if (toPoint.player === null || toPoint.player === movingColor) {
            // Moving to an empty point or point with the same color
            this.gameState[fromBar]--;
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: toPoint.checkers + 1
            };
            this.updateGameState();
            return true;
        } else if (toPoint.player !== movingColor && toPoint.checkers === 1) {
            // Eating the opponent's checker
            const opponentBar = movingColor === 'white' ? 'barBlack' : 'barWhite';
            this.gameState[fromBar]--;
            this.gameState[opponentBar]++;
            this.gameState.points[to] = {
                ...toPoint,
                player: movingColor,
                checkers: 1
            };
            this.updateGameState();
            return true;
        }
    
        console.error('Invalid move from bar to board.');
        return false;
    }
    
    // Helper method to handle moving between points on the board
    moveBetweenPoints(from, to, movingColor) {
        const fromPoint = this.gameState.points[from];
        const toPoint = this.gameState.points[to];
    
        if (fromPoint.checkers <= 0 || fromPoint.player !== movingColor) {
            console.error('No checker to move or wrong color.');
            return false;
        }
    
        if (toPoint.player === null || toPoint.player === movingColor) {
            // Moving to an empty point or point with the same color
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
            this.updateGameState();
            return true;
        } else if (toPoint.player !== movingColor && toPoint.checkers === 1) {
            // Eating the opponent's checker
            const opponentBar = movingColor === 'white' ? 'barBlack' : 'barWhite';
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
            this.updateGameState();
            return true;
        }
    
        console.error('Invalid move between board points.');
        return false;
    }


    bearOff(from, to, movingColor) {
        // Implement bearing off logic here
        // Remember to check if all checkers are in the home board before allowing bearing off
    }
        
    getCurrentPlayer() {
        return this.gameState.currentTurn;
    }

    getPlayerColor(playerId) {
        return this.gameState.players.white.id === playerId ? 'white' : 'black';
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
                isRolled: this.gameState.isRolled,
                players: this.gameState.players
            })
        };
    }
}

export default new GameLogic();