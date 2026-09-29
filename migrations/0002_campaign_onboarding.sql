ALTER TABLE "businesses" ADD COLUMN "type" text;
--> statement-breakpoint
CREATE TABLE "campaigns" (
  "id" serial PRIMARY KEY NOT NULL,
  "business_id" integer NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "campaign_id" integer;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "campaigns_business_id_idx" ON "campaigns" USING btree ("business_id");
