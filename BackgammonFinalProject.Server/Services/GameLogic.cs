using BackgammonFinalProject.Server.Models;
using System;
using System.Linq;

namespace BackgammonFinalProject.Server.Services
{
    public class GameLogic(GameLogicValidations validations)
    {
        private readonly GameLogicValidations _validations = validations;

        public void InitializeGame(Game game)
        {
            game.Points[0].PlayerColor = "white"; game.Points[0].Checkers = 2;
            game.Points[5].PlayerColor = "black"; game.Points[5].Checkers = 5;
            game.Points[7].PlayerColor = "black"; game.Points[7].Checkers = 3;
            game.Points[11].PlayerColor = "white"; game.Points[11].Checkers = 5;
            game.Points[12].PlayerColor = "black"; game.Points[12].Checkers = 5;
            game.Points[16].PlayerColor = "white"; game.Points[16].Checkers = 3;
            game.Points[18].PlayerColor = "white"; game.Points[18].Checkers = 5;
            game.Points[23].PlayerColor = "black"; game.Points[23].Checkers = 2;
            game.BarWhite = 0;
            game.BarBlack = 0;
            game.OutsideBarWhite = 0;
            game.OutsideBarBlack = 0;
            game.DiceValues = [0, 0];
            game.IsRolled = false;
            game.GameStatus = GameStatus.InProgress;

            var random = new Random();
            var startingPlayerId = game.Players.ElementAt(random.Next(2)).Id;
            game.CurrentTurn = startingPlayerId;
            game.WhitePlayerId = startingPlayerId;
            game.BlackPlayerId = game.Players.First(p => p.Id != startingPlayerId).Id;
        }

        public (bool Success, string Message) RollDice(Game game, int userId)
        {
            (bool success, string message) = _validations.CanRollDice(game, userId);

            if (!success)
                return (false, message);

            Random random = new();
            int die1 = random.Next(1, 7);
            int die2 = random.Next(1, 7);

            game.DiceValues = die1 == die2 ? [die1, die1, die1, die1] : [die1, die2];
            game.IsRolled = true;

            string movingColor = game.CurrentTurn == game.WhitePlayerId ? "white" : "black";
            if (!_validations.CheckForPossibleMovesFromBar(game, movingColor))
            {
                EndTurn(game);
                return (true, "No valid moves from the bar, turn skipped");
            }

            return (true, "Dice rolled successfully");
        }

        public (bool Success, string Message) MoveChecker(Game game, int userId, string from, string to)
        {
            var validationResult = _validations.IsValidMove(game, userId, from, to);
            if (!validationResult.Success)
                return validationResult;

            string movingColor = game.CurrentTurn == game.WhitePlayerId ? "white" : "black";
            var moveResult = ExecuteMove(game, from, to, movingColor);

            if (moveResult.Success)
            {
                if (_validations.CheckWinCondition(game, movingColor))
                {
                    game.GameStatus = GameStatus.Completed;
                    game.WinnerId = userId;
                    game.EndTime = DateTime.UtcNow;
                    return (true, $"{movingColor} has won the game!");
                }

                if (game.DiceValues.Length == 0)
                {
                    EndTurn(game);
                }

                return (true, moveResult.Message);
            }

            return (false, moveResult.Message);
        }

        private (bool Success, string Message) ExecuteMove(Game game, string from, string to, string movingColor)
        {

            bool isFromBar = from == "barWhite" || from == "barBlack";
            bool isBearingOff = to == "outsideWhite" || to == "outsideBlack";

            if (isFromBar && int.TryParse(to, out int toPoint))
                return MoveFromBarToPoint(game, toPoint, movingColor);
            else if (int.TryParse(from, out int fromPoint) && int.TryParse(to, out toPoint))
            {

                int moveDistance = Math.Abs(toPoint - fromPoint);
                if (game.DiceValues.Contains(moveDistance))
                    return MoveBetweenPoints(game, fromPoint, toPoint, movingColor);
                else
                {
                    List<int> path = _validations.CanSumToMove(moveDistance, game.DiceValues, game, fromPoint, movingColor).Path;
                    int currentPosition = fromPoint;
                    foreach (int step in path)
                    {
                        int nextPosition = movingColor == "white" ? currentPosition + step : currentPosition - step;
                        var moveResult = MoveBetweenPoints(game, currentPosition, nextPosition, movingColor);
                        if (!moveResult.Success)
                            return moveResult;
                        currentPosition = nextPosition;
                    }
                    return (true, "Move completed successfully");
                }
            }
            else if (int.TryParse(from, out fromPoint) && isBearingOff)
                return BearOff(game, fromPoint, movingColor);

            return (false, "Invalid move type");
        }

        private static (bool Success, string Message) MoveFromBarToPoint(Game game, int to, string movingColor)
        {
            var toPoint = game.Points[to];
            int diceValueUsed = movingColor == "white" ? to + 1 : 24 - to;

            if (!game.DiceValues.Contains(diceValueUsed))
                return (false, "Invalid move: dice value not available");

            if (toPoint.PlayerColor == null || toPoint.PlayerColor == movingColor)
            {
                if (movingColor == "white") game.BarWhite--; else game.BarBlack--;
                game.Points[to] = new Point
                {
                    PlayerColor = movingColor,
                    Checkers = toPoint.Checkers + 1
                };
            }
            else if (toPoint.PlayerColor != movingColor && toPoint.Checkers == 1)
            {
                if (movingColor == "white") { game.BarWhite--; game.BarBlack++; } else { game.BarBlack--; game.BarWhite++; }
                game.Points[to] = new Point
                {
                    PlayerColor = movingColor,
                    Checkers = 1
                };
            }
            else
            {
                return (false, "Invalid move from bar to board");
            }

            RemoveUsedDiceValue(game, diceValueUsed);
            return (true, "Moved checker from bar to point");
        }

        private static (bool Success, string Message) MoveBetweenPoints(Game game, int from, int to, string movingColor)
        {
            var fromPoint = game.Points[from];
            var toPoint = game.Points[to];

            if (fromPoint.Checkers <= 0 || fromPoint.PlayerColor != movingColor)
                return (false, "No checker to move or wrong color");

            int moveDistance = Math.Abs(to - from);

            if (toPoint.PlayerColor == null || toPoint.PlayerColor == movingColor)
            {
                game.Points[from] = new Point
                {
                    PlayerColor = fromPoint.Checkers == 1 ? null : movingColor,
                    Checkers = fromPoint.Checkers - 1
                };
                game.Points[to] = new Point
                {
                    PlayerColor = movingColor,
                    Checkers = toPoint.Checkers + 1
                };
            }
            else if (toPoint.PlayerColor != movingColor && toPoint.Checkers == 1)
            {
                if (movingColor == "white") game.BarBlack++; else game.BarWhite++;
                game.Points[from] = new Point
                {
                    PlayerColor = fromPoint.Checkers == 1 ? null : movingColor,
                    Checkers = fromPoint.Checkers - 1
                };
                game.Points[to] = new Point
                {
                    PlayerColor = movingColor,
                    Checkers = 1
                };
            }
            else
            {
                return (false, "Invalid move between board points");
            }

            RemoveUsedDiceValue(game, moveDistance);
            return (true, "Moved checker between points");
        }

        private static (bool Success, string Message) BearOff(Game game, int from, string movingColor)
        {
            var fromPoint = game.Points[from];
            game.Points[from] = new Point
            {
                PlayerColor = fromPoint.Checkers == 1 ? null : movingColor,
                Checkers = fromPoint.Checkers - 1
            };
            int moveDistance = movingColor == "white" ? 24 - from : from + 1;
            RemoveUsedDiceValue(game, moveDistance);
            if (movingColor == "white")
                game.OutsideBarWhite += 1;
            else
                game.OutsideBarBlack += 1;
            return (true, "Beared off checker successfully");
        }

        private static void RemoveUsedDiceValue(Game game, int usedValue)
        {
            var diceList = game.DiceValues.ToList();
            if (!diceList.Remove(usedValue))
            {
                // Remove the largest die value that's smaller than or equal to the used value
                var largestUsableDie = diceList.Where(d => d <= usedValue).OrderByDescending(d => d).FirstOrDefault();
                if (largestUsableDie > 0)
                {
                    diceList.Remove(largestUsableDie);
                }
            }
            game.DiceValues = [.. diceList];
        }

        private static void EndTurn(Game game)
        {
            game.CurrentTurn = game.CurrentTurn == game.WhitePlayerId ? game.BlackPlayerId : game.WhitePlayerId;
            game.DiceValues = [0, 0];
            game.IsRolled = false;
        }

        public static (bool Success, string Message) ForfeitGame(Game game, int userId)
        {
            if (game.GameStatus != GameStatus.InProgress)
                return (false, "The game is not in progress");

            game.GameStatus = GameStatus.Completed;
            game.WinnerId = game.Players.First(p => p.Id != userId).Id;
            game.EndTime = DateTime.UtcNow;

            return (true, $"Player {userId} has forfeited the game");
        }

        public static (bool Success, string Message) OfferDraw(Game game, int userId)
        {
            if (game.GameStatus != GameStatus.InProgress)
                return (false, "The game is not in progress");

            game.DrawOfferedBy = userId;

            return (true, $"Player {userId} has offered a draw");
        }

        public static (bool Success, string Message) RespondToDraw(Game game, int userId, bool accept)
        {
            if (game.GameStatus != GameStatus.InProgress)
                return (false, "The game is not in progress");

            if (game.DrawOfferedBy == null)
                return (false, "No draw has been offered");

            if (game.DrawOfferedBy == userId)
                return (false, "You cannot respond to your own draw offer");

            if (accept)
            {
                game.GameStatus = GameStatus.Completed;
                game.EndTime = DateTime.UtcNow;
                return (true, "The game has ended in a draw");
            }
            else
            {
                game.DrawOfferedBy = null;
                return (true, "The draw offer has been declined");
            }
        }
    }
}