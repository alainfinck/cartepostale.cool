import * as migration_20260222_204641_add_credits_to_user from './20260222_204641_add_credits_to_user';

export const migrations = [
  {
    up: migration_20260222_204641_add_credits_to_user.up,
    down: migration_20260222_204641_add_credits_to_user.down,
    name: '20260222_204641_add_credits_to_user'
  },
];
