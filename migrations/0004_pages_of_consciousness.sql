CREATE TABLE "literary_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"book_title" text NOT NULL,
	"author" text NOT NULL,
	"analysis" text NOT NULL,
	"themes" text[],
	"insights" text[],
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_title" text NOT NULL,
	"author" text NOT NULL,
	"discussion" text NOT NULL,
	"participants" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "literary_analyses" ADD CONSTRAINT "literary_analyses_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint