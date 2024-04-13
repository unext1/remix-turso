CREATE TABLE `task_assigness` (
	`user_id` text NOT NULL,
	`task_jd` text NOT NULL,
	PRIMARY KEY(`task_jd`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_jd`) REFERENCES `project_task`(`id`) ON UPDATE no action ON DELETE cascade
);
