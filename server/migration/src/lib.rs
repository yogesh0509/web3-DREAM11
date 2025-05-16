pub use sea_orm_migration::prelude::*;

mod m20231013_000001_create_space_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20231013_000001_create_space_table::Migration),
        ]
    }
}
