CREATE TABLE `ledger` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text,
	`key` integer NOT NULL,
	`before` integer DEFAULT 0,
	`mutation` integer DEFAULT 0,
	`after` integer NOT NULL,
	`type` text NOT NULL,
	`data` text,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`price` integer,
	`price_sell` integer,
	`data` text,
	`status` integer DEFAULT 1,
	`created_at` integer,
	`created_by` integer,
	`updated_at` integer,
	`updated_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_tag` (
	`id` integer PRIMARY KEY NOT NULL,
	`product_id` integer,
	`tag_id` integer,
	`created_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tag` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`type` text,
	`created_at` integer,
	`created_by` integer,
	`updated_at` integer,
	`updated_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`product_id` integer,
	`user_id` integer,
	`amount` integer,
	`price` integer,
	`profit` integer DEFAULT 0,
	`data` text,
	`status` integer DEFAULT 1,
	`date` integer,
	`created_at` integer,
	`updated_at` integer,
	`created_by` integer,
	`updated_by` integer,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_key_unique` ON `transaction` (`key`);--> statement-breakpoint
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
