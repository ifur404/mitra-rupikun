CREATE TABLE `transaction` (
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
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product` (
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
INSERT INTO `__new_product`("id", "name", "price", "price_sell", "data", "status", "created_at", "created_by", "updated_at", "updated_by") SELECT "id", "name", "price", "price_sell", "data", "status", "created_at", "created_by", "updated_at", "updated_by" FROM `product`;--> statement-breakpoint
DROP TABLE `product`;--> statement-breakpoint
ALTER TABLE `__new_product` RENAME TO `product`;--> statement-breakpoint
PRAGMA foreign_keys=ON;