ALTER TABLE task_comment ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE task_comment ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;