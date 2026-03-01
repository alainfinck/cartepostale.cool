import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column'
import * as migration_20260224_add_media_location from './20260224_add_media_location'
import * as migration_20260225_204729_add_hide_map from './20260225_204729_add_hide_map'
import * as migration_20260226_063253_add_socials_to_users from './20260226_063253_add_socials_to_users'
import * as migration_20260301_080507 from './20260301_080507'
import * as migration_20260301_081037 from './20260301_081037'

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
  {
    up: migration_20260225_204729_add_hide_map.up,
    down: migration_20260225_204729_add_hide_map.down,
    name: '20260225_204729_add_hide_map',
  },
  {
    up: migration_20260226_063253_add_socials_to_users.up,
    down: migration_20260226_063253_add_socials_to_users.down,
    name: '20260226_063253_add_socials_to_users',
  },
  {
    up: migration_20260301_080507.up,
    down: migration_20260301_080507.down,
    name: '20260301_080507',
  },
  {
    up: migration_20260301_081037.up,
    down: migration_20260301_081037.down,
    name: '20260301_081037',
  },
]
