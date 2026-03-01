import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "gallery_categories" ADD COLUMN IF NOT EXISTS "parent_id" integer;
  ALTER TABLE "gallery_categories" DROP CONSTRAINT IF EXISTS "gallery_categories_parent_id_gallery_categories_id_fk";
  ALTER TABLE "gallery_categories" ADD CONSTRAINT "gallery_categories_parent_id_gallery_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery_categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "gallery_categories_parent_idx" ON "gallery_categories" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "gallery_categories" DROP CONSTRAINT IF EXISTS "gallery_categories_parent_id_gallery_categories_id_fk";
  DROP INDEX IF EXISTS "gallery_categories_parent_idx";
  ALTER TABLE "gallery_categories" DROP COLUMN IF EXISTS "parent_id";`)
}
