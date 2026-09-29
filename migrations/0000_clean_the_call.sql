CREATE TYPE "public"."analysis_status" AS ENUM('DONE', 'PENDING', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."overall_sentiment" AS ENUM('positive', 'negative', 'neutral', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."sentiment" AS ENUM('positive', 'negative', 'neutral');--> statement-breakpoint
CREATE TABLE "review_aspects" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"name" text NOT NULL,
	"sentiment" "sentiment" NOT NULL,
	"evidence" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"overall_sentiment" "overall_sentiment",
	"analysis_status" "analysis_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "review_aspects" ADD CONSTRAINT "review_aspects_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;