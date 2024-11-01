using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackgammonFinalProject.Server.Migrations
{
    /// <inheritdoc />
    public partial class offerdraw : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DrawOfferStatus",
                table: "Games",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DrawOfferStatus",
                table: "Games");
        }
    }
}
