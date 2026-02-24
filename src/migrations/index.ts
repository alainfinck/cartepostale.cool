import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column';
import * as migration_20260224_add_media_location from './20260224_add_media_location';

export const migrations = [
  {
    up: migration_20260222_210000_add_credits_column.up,
    down: migration_20260222_210000_add_credits_column.down,
    name: '20260222_210000_add_credits_column',
  },
  {
    up: migration_20260224_add_media_location.up,
    down: migration_20260224_add_media_location.down,
    name: '20260224_add_media_location',
  },
];
