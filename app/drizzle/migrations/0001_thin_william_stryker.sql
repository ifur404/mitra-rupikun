CREATE TABLE `product2` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text,
	`name` text,
	`price` integer,
	`data` text,
	`created_at` integer,
	`created_by` integer,
	`updated_at` integer,
	`updated_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `product` ADD `code` text;