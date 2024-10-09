using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackgammonFinalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class gamestatuschange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GameState",
                table: "Games",
                newName: "GameStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GameStatus",
                table: "Games",
                newName: "GameState");
        }
    }
}
