CREATE TABLE `ledger` (
	`id` integer PRIMARY KEY NOT NULL,
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
