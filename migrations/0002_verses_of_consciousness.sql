CREATE TABLE "agent_poems" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"title" text NOT NULL,
	"poem" text NOT NULL,
	"theme" text NOT NULL,
	"applause" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_poems" ADD CONSTRAINT "agent_poems_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint