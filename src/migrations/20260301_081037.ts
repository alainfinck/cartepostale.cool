import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "agencies" ADD COLUMN "banner_enabled" boolean DEFAULT false;
  ALTER TABLE "agencies" ADD COLUMN "banner_text" varchar;
  ALTER TABLE "agencies" ADD COLUMN "banner_subtext" varchar;
  ALTER TABLE "agencies" ADD COLUMN "banner_color" varchar DEFAULT '#0d9488';
  ALTER TABLE "agencies" ADD COLUMN "banner_text_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "agencies" ADD COLUMN "banner_link" varchar;
  ALTER TABLE "agencies" ADD COLUMN "banner_image_id" integer;
  ALTER TABLE "agencies" ADD CONSTRAINT "agencies_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "agencies_banner_image_idx" ON "agencies" USING btree ("banner_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "agencies" DROP CONSTRAINT "agencies_banner_image_id_media_id_fk";
  
  DROP INDEX "agencies_banner_image_idx";
  ALTER TABLE "agencies" DROP COLUMN "banner_enabled";
  ALTER TABLE "agencies" DROP COLUMN "banner_text";
  ALTER TABLE "agencies" DROP COLUMN "banner_subtext";
  ALTER TABLE "agencies" DROP COLUMN "banner_color";
  ALTER TABLE "agencies" DROP COLUMN "banner_text_color";
  ALTER TABLE "agencies" DROP COLUMN "banner_link";
  ALTER TABLE "agencies" DROP COLUMN "banner_image_id";`)
}
