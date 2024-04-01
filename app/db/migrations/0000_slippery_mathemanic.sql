CREATE TABLE `user` (
	`id` text PRIMARY KEY DEFAULT (uuid4()) NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`image_url` text
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY DEFAULT (uuid4()) NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`email` text,
	`workplace_id` text,
	FOREIGN KEY (`workplace_id`) REFERENCES `workplace`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workplace_member` (
	`user_id` text NOT NULL,
	`workplace_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `workplace_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workplace_id`) REFERENCES `workplace`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workplace` (
	`id` text PRIMARY KEY DEFAULT (uuid4()) NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);