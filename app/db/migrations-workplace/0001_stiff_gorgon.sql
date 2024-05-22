CREATE TABLE `task_comment` (
	`id` text PRIMARY KEY DEFAULT (uuid4()) NOT NULL,
	`description` text,
	`userId` text,
	`task_Id` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`task_Id`) REFERENCES `project_task`(`id`) ON UPDATE no action ON DELETE cascade
);
