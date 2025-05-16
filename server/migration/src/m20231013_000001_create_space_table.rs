use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create game_details table first
        manager
            .create_table(
                Table::create()
                    .table(GameDetails::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(GameDetails::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(GameDetails::GameAddress).string().not_null())
                    .col(ColumnDef::new(GameDetails::AuctionAddress).string().not_null())
                    .col(ColumnDef::new(GameDetails::PicAddress).string().not_null())
                    .col(ColumnDef::new(GameDetails::AuctionStartTime).timestamp().not_null())
                    .col(ColumnDef::new(GameDetails::AuctionEndTime).timestamp().not_null())
                    .col(ColumnDef::new(GameDetails::FinalResultsTime).timestamp().not_null())
                    .col(ColumnDef::new(GameDetails::TotalPlayers).integer().not_null())
                    .to_owned(),
            )
            .await?;

        // Create player_details table that references game_details
        manager
            .create_table(
                Table::create()
                    .table(PlayerDetails::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PlayerDetails::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(PlayerDetails::Image).string().not_null())
                    .col(ColumnDef::new(PlayerDetails::Name).string().not_null())
                    .col(ColumnDef::new(PlayerDetails::Role).string().not_null())
                    .col(ColumnDef::new(PlayerDetails::GameId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-player-game")
                            .from(PlayerDetails::Table, PlayerDetails::GameId)
                            .to(GameDetails::Table, GameDetails::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create bidding table that references player_details
        manager
            .create_table(
                Table::create()
                    .table(Bidding::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Bidding::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Bidding::Bidder).string().not_null())
                    .col(
                        ColumnDef::new(Bidding::Bid)
                            .decimal_len(10, 0)
                            .not_null()
                    )
                    .col(ColumnDef::new(Bidding::PlayerId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-bidding-player")
                            .from(Bidding::Table, Bidding::PlayerId)
                            .to(PlayerDetails::Table, PlayerDetails::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order of creation
        manager
            .drop_table(Table::drop().table(Bidding::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(PlayerDetails::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(GameDetails::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum GameDetails {
    Table,
    Id,
    GameAddress,
    AuctionAddress,
    PicAddress,
    AuctionStartTime,
    AuctionEndTime,
    FinalResultsTime,
    TotalPlayers,
}

#[derive(DeriveIden)]
enum PlayerDetails {
    Table,
    Id,
    Image,
    Name,
    Role,
    GameId,
}

#[derive(DeriveIden)]
enum Bidding {
    Table,
    Id,
    Bidder,
    Bid,
    PlayerId,
}