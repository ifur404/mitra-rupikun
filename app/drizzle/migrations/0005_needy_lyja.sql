ALTER TABLE `transaction` ADD `key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_key_unique` ON `transaction` (`key`);