import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "socials_instagram" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_tiktok" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_facebook" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_linkedin" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_twitter" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_youtube" varchar;
  ALTER TABLE "users" ADD COLUMN "socials_website" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "socials_instagram";
  ALTER TABLE "users" DROP COLUMN "socials_tiktok";
  ALTER TABLE "users" DROP COLUMN "socials_facebook";
  ALTER TABLE "users" DROP COLUMN "socials_linkedin";
  ALTER TABLE "users" DROP COLUMN "socials_twitter";
  ALTER TABLE "users" DROP COLUMN "socials_youtube";
  ALTER TABLE "users" DROP COLUMN "socials_website";`)
}
