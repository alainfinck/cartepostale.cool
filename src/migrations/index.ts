import * as migration_20260222_210000_add_credits_column from './20260222_210000_add_credits_column';
import * as migration_20260222_231212_fix_front_caption_font_size_type from './20260222_231212_fix_front_caption_font_size_type';

export const migrations = [
  {
    up: migration_20260222_210000_add_credits_column.up,
    down: migration_20260222_210000_add_credits_column.down,
    name: '20260222_210000_add_credits_column',
  },
  {
    up: migration_20260222_231212_fix_front_caption_font_size_type.up,
    down: migration_20260222_231212_fix_front_caption_font_size_type.down,
    name: '20260222_231212_fix_front_caption_font_size_type'
  },
];
