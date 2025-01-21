CREATE TABLE `ledger` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text,
	`key` text NOT NULL,
	`before` integer DEFAULT 0,
	`mutation` integer DEFAULT 0,
	`after` integer NOT NULL,
	`data` text,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text,
	`price` integer,
	`data` text,
	`category` text,
	`created_at` integer,
	`created_by` integer,
	`updated_at` integer,
	`updated_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_code_unique` ON `product` (`code`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`salt` text,
	`is_staff` integer,
	`groups` text,
	`password` text,
	`picture` text,
	`phone_number` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `webhook` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text,
	`created_at` integer
);
