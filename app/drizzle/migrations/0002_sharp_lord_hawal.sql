CREATE TABLE `product` (
	`id` integer PRIMARY KEY NOT NULL,
	`product_id` integer,
	`user_id` integer,
	`amount` integer,
	`price` integer,
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
ALTER TABLE `user` ADD `created_at` integer;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `create_at`;