import * as migration_._20260222_210000_add_credits_column from './._20260222_210000_add_credits_column';
import * as migration_._20260224_add_media_location from './._20260224_add_media_location';
import * as migration_._20260225_204729_add_hide_map from './._20260225_204729_add_hide_map';
import * as migration_._index from './._index';
import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column';
import * as migration_20260224_add_media_location from './20260224_add_media_location';
import * as migration_20260225_204729_add_hide_map from './20260225_204729_add_hide_map';

export const migrations = [
  {
    up: migration_._20260222_210000_add_credits_column.up,
    down: migration_._20260222_210000_add_credits_column.down,
    name: '._20260222_210000_add_credits_column',
  },
  {
    up: migration_._20260224_add_media_location.up,
    down: migration_._20260224_add_media_location.down,
    name: '._20260224_add_media_location',
  },
  {
    up: migration_._20260225_204729_add_hide_map.up,
    down: migration_._20260225_204729_add_hide_map.down,
    name: '._20260225_204729_add_hide_map',
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
    name: '20260225_204729_add_hide_map'
  },
];
