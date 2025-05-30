//! `SeaORM` Entity, @generated by sea-orm-codegen 1.0.0-rc.5

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "player_details")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub image: String,
    pub name: String,
    pub role: String,
    pub game_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation, Serialize, Deserialize)]
pub enum Relation {
    #[sea_orm(has_many = "super::bidding::Entity")]
    Bidding,
    #[sea_orm(
        belongs_to = "super::game_details::Entity",
        from = "Column::GameId",
        to = "super::game_details::Column::Id",
        on_update = "Restrict",
        on_delete = "Cascade"
    )]
    GameDetails,
}

impl Related<super::bidding::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Bidding.def()
    }
}

impl Related<super::game_details::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::GameDetails.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
