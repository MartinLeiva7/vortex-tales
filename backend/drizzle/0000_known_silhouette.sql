CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`story_id` text NOT NULL,
	`current_chapter` integer NOT NULL,
	`current_node_id` text NOT NULL,
	`playtime_seconds` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_trophies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`story_id` text NOT NULL,
	`trophy_id` text NOT NULL,
	`unlocked_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `progress_user_id_story_id_unique` ON `progress` (`user_id`,`story_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_trophies_user_id_story_id_trophy_id_unique` ON `user_trophies` (`user_id`,`story_id`,`trophy_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);