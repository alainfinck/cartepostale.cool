import * as migration_._20260225_204729_add_hide_map from './._20260225_204729_add_hide_map';
import * as migration_._20260226_063253_add_socials_to_users from './._20260226_063253_add_socials_to_users';
import * as migration_._index from './._index';
import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column';
import * as migration_20260224_add_media_location from './20260224_add_media_location';
import * as migration_20260225_204729_add_hide_map from './20260225_204729_add_hide_map';
import * as migration_20260226_063253_add_socials_to_users from './20260226_063253_add_socials_to_users';

export const migrations = [
  {
    up: migration_._20260225_204729_add_hide_map.up,
    down: migration_._20260225_204729_add_hide_map.down,
    name: '._20260225_204729_add_hide_map',
  },
  {
    up: migration_._20260226_063253_add_socials_to_users.up,
    down: migration_._20260226_063253_add_socials_to_users.down,
    name: '._20260226_063253_add_socials_to_users',
  },
  {
    up: migration_._index.up,
    down: migration_._index.down,
    name: '._index',
  },
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
  {
    up: migration_20260225_204729_add_hide_map.up,
    down: migration_20260225_204729_add_hide_map.down,
    name: '20260225_204729_add_hide_map',
  },
  {
    up: migration_20260226_063253_add_socials_to_users.up,
    down: migration_20260226_063253_add_socials_to_users.down,
    name: '20260226_063253_add_socials_to_users'
  },
];
