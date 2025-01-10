CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`salt` text,
	`is_staff` integer,
	`password` text,
	`picture` text,
	`phone_number` text,
	`create_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);