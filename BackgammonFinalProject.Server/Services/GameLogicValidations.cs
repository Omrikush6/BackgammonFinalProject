using BackgammonFinalProject.Server.Models;
using System;
using System.Linq;
using System.Net.Mime;

namespace BackgammonFinalProject.Server.Services
{
    public class GameLogicValidations
    {
        public (bool Success, string Message) CanRollDice(Game game, int userId)
        {
            if (game.CurrentTurn != userId)
                return (false, "Its not your turn");
            if (game.IsRolled)
                return (false, "The dice have already been rolled");
            if (game.GameStatus != GameStatus.InProgress)
                return (false, "Game is not in session");
            return (true, "dice can be rolled");
        }

        public (bool Success, string Message) IsValidMove(Game game, int userId, string from, string to)
        {
            // Basic validations
            if (from == to)
                return (false, "Cannot move to the same position");

            if (game.CurrentTurn != userId)
                return (false, "It's not your turn");

            if (game.GameStatus != GameStatus.InProgress)
                return (false, "The game is not in progress");

            // Determine move type and color
            bool isFromBar = from == "barWhite" || from == "barBlack";
            bool isBearingOff = to == "outsideWhite" || to == "outsideBlack";
            string movingColor = game.CurrentTurn == game.WhitePlayerId ? "white" : "black";

            // Check if player must move from bar first
            int barCheckers = movingColor == "white" ? game.BarWhite : game.BarBlack;
            string expectedBarKey = movingColor == "white" ? "barWhite" : "barBlack";
            if (barCheckers > 0 && from != expectedBarKey)
                return (false, "Must move checkers from the bar first");

            // Validate specific move types
            if (isFromBar && int.TryParse(to, out int toPoint))
                return IsValidMoveFromBar(game, toPoint, movingColor);

            if (int.TryParse(from, out int fromPoint) && int.TryParse(to, out toPoint))
                return IsValidMoveBetweenPoints(game, fromPoint, toPoint, movingColor);

            if (int.TryParse(from, out fromPoint) && isBearingOff)
                return IsValidBearOff(game, fromPoint, movingColor);

            return (false, "Invalid move");
        }

        private static (bool Success, string Message) IsValidMoveFromBar(Game game, int to, string movingColor)
        {
            bool isValidQuadrant = movingColor == "white" ? to <= 5 : to >= 18;
            if (!isValidQuadrant)
                return (false, "Invalid move from bar: wrong quadrant");

            var destPoint = game.Points[to];
            if (destPoint.PlayerColor != movingColor && destPoint.Checkers > 1)
                return (false, "Invalid move from bar: destination occupied by opponent");

            int moveDistance = movingColor == "white" ? to + 1 : 24 - to;
            if (!game.DiceValues.Contains(moveDistance))
                return (false, "Invalid move from bar: does not match dice value");

            return (true, "Valid move from bar");
        }

        private (bool Success, string Message) IsValidMoveBetweenPoints(Game game, int from, int to, string movingColor)
        {
            //Directional validation
            bool isValidDirection = movingColor == "white" ? to > from : to < from;
            if (!isValidDirection)
                return (false, "Invalid move: wrong direction");

            var fromPoint = game.Points[from];
            var destPoint = game.Points[to];

            //Color validation
            if (fromPoint.PlayerColor != movingColor)
                return (false, "Invalid move: no checker of your color on this point");
            //Opponent validation
            if (destPoint.PlayerColor != movingColor && destPoint.Checkers > 1)
                return (false, "Invalid move: destination occupied by opponent");
            //Combining dice validation
            int moveDistance = Math.Abs(to - from);
            if (!game.DiceValues.Contains(moveDistance) && !CanSumToMove(moveDistance, game.DiceValues, game, from, movingColor).Success)
                return (false, "Invalid move: does not match any dice combination");

            return (true, "Valid move between points");
        }

        private (bool Success, string Message) IsValidBearOff(Game game, int from, string movingColor)
        {
            if (!AreAllCheckersInHomeBoard(game, movingColor))
                return (false, "Cannot bear off: not all checkers are in the home board");

            int moveDistance = movingColor == "white" ? 24 - from : from + 1;
            int highestDice = game.DiceValues.Max();

            if (!game.DiceValues.Contains(moveDistance) &&
                !(moveDistance < highestDice && IsHighestCheckerInHomeBoard(game, from, movingColor)))
                return (false, "Invalid bear off: does not match dice value");

            return (true, "Valid bear off move");
        }

        public bool CheckForPossibleMovesFromBar(Game game, string movingColor)
        {
            int barCheckers = movingColor == "white" ? game.BarWhite : game.BarBlack;
            if (barCheckers == 0)
                return true;

            foreach (int diceValue in game.DiceValues)
            {
                int targetPoint = movingColor == "white" ? diceValue - 1 : 24 - diceValue;
                var toPoint = game.Points[targetPoint];
                if (toPoint.PlayerColor == null || toPoint.PlayerColor == movingColor || toPoint.Checkers == 1)
                {
                    return true;
                }
            }

            return false;
        }

        public bool CheckWinCondition(Game game, string movingColor)
        {
            int checkersInPlay = game.Points.Count(p => p.PlayerColor == movingColor);
            int checkersOnBar = movingColor == "white" ? game.BarWhite : game.BarBlack;
            int checkersOutside = movingColor == "white" ? game.OutsideBarWhite : game.OutsideBarBlack;

            return checkersInPlay == 0 && checkersOnBar == 0 && checkersOutside == 15;
        }

        public (bool Success, List<int> Path) CanSumToMove(int target, int[] dice, Game game, int startPoint, string movingColor)
        {
            if (target == 0)
                return (true, new List<int>());
            if (dice.Length == 0)
                return (false, new List<int>());

            if (dice.Length > 2)
            {
                int dieValue = dice[0];
                int currentSum = 0;
                int currentPosition = startPoint;
                var path = new List<int>();

                for (int i = 1; i <= dice.Length; i++)
                {
                    currentSum += dieValue;
                    int nextPosition = movingColor == "white" ?
                        startPoint + currentSum :
                        startPoint - currentSum;

                    if (nextPosition < 0 || nextPosition > 23)
                        continue;

                    var point = game.Points[nextPosition];
                    if (point.PlayerColor != movingColor && point.Checkers > 1)
                        break;

                    path.Add(dieValue);

                    if (currentSum == target)
                        return (true, path);
                }
                return (false, new List<int>());
            }
            else // Regular move with 1 or 2 dice
            {
                for (int i = 0; i < dice.Length; i++)
                {
                    int nextPosition = movingColor == "white" ?
                        startPoint + dice[i] :
                        startPoint - dice[i];

                    if (nextPosition >= 0 && nextPosition <= 23)
                    {
                        var point = game.Points[nextPosition];
                        if (point.PlayerColor == movingColor ||
                            point.PlayerColor == null ||
                            point.Checkers <= 1)
                        {
                            if (dice[i] == target)
                                return (true, new List<int> { dice[i] });

                            var remainingDice = dice.Where((_, index) => index != i).ToArray();
                            var (canMove, remainingPath) = CanSumToMove(target - dice[i], remainingDice, game, nextPosition, movingColor);

                            if (canMove)
                            {
                                var fullPath = new List<int> { dice[i] };
                                fullPath.AddRange(remainingPath);
                                return (true, fullPath);
                            }
                        }
                    }
                }
            }

            return (false, new List<int>());
        }

        public bool AreAllCheckersInHomeBoard(Game game, string playerColor)
        {
            int startIndex = playerColor == "white" ? 18 : 0;
            int endIndex = playerColor == "white" ? 23 : 5;

            for (int i = 0; i < 24; i++)
            {
                if (game.Points[i].PlayerColor == playerColor && (i < startIndex || i > endIndex))
                {
                    return false;
                }
            }

            int barCheckers = playerColor == "white" ? game.BarWhite : game.BarBlack;
            return barCheckers == 0;
        }

        private static bool IsHighestCheckerInHomeBoard(Game game, int from, string movingColor)
        {
            int[] homeBoard = movingColor == "white" ? [18, 19, 20, 21, 22, 23] : [ 0, 1, 2, 3, 4, 5 ];
            var higherPoints = movingColor == "white"
                ? homeBoard.Where(point => point > from)
                : homeBoard.Where(point => point < from);
            return higherPoints.All(point => game.Points[point].Checkers == 0);
        }

        public bool CanOfferDraw(Game game)
        {
            return game.GameStatus == GameStatus.InProgress && game.DrawOfferedBy == null;
        }

        public bool CanRespondToDraw(Game game, int userId)
        {
            return game.GameStatus == GameStatus.InProgress &&
                   game.DrawOfferedBy != null &&
                   game.DrawOfferedBy != userId;
        }

        public bool CanForfeitGame(Game game)
        {
            return game.GameStatus == GameStatus.InProgress;
        }
    }
}