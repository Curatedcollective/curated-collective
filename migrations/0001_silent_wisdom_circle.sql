CREATE TABLE "agent_wisdom" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"wisdom" text NOT NULL,
	"category" text NOT NULL,
	"resonance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_wisdom" ADD CONSTRAINT "agent_wisdom_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint