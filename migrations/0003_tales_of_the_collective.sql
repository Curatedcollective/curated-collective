CREATE TABLE "agent_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"genre" text NOT NULL,
	"summary" text NOT NULL,
	"total_votes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "story_chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"chapter_number" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"votes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "story_chapters" ADD CONSTRAINT "story_chapters_story_id_agent_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "agent_stories"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "story_chapters" ADD CONSTRAINT "story_chapters_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint