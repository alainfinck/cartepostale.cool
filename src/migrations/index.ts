import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column'

export const migrations = [
  {
    up: migration_20260222_210000_add_credits_column.up,
    down: migration_20260222_210000_add_credits_column.down,
    name: '20260222_210000_add_credits_column',
  },
]
