CREATE TABLE `ai_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`model_id` text NOT NULL,
	`prompt_tokens` text DEFAULT '0' NOT NULL,
	`completion_tokens` text DEFAULT '0' NOT NULL,
	`days_since_epoch` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `community_theme` (
	`id` text PRIMARY KEY NOT NULL,
	`theme_id` text NOT NULL,
	`user_id` text NOT NULL,
	`published_at` integer NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`theme_id`) REFERENCES `theme`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_theme_theme_id_unique` ON `community_theme` (`theme_id`);--> statement-breakpoint
CREATE INDEX `community_theme_published_at_idx` ON `community_theme` (`published_at`);--> statement-breakpoint
CREATE INDEX `community_theme_like_count_idx` ON `community_theme` (`like_count`);--> statement-breakpoint
CREATE TABLE `community_theme_tag` (
	`community_theme_id` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`community_theme_id`, `tag`),
	FOREIGN KEY (`community_theme_id`) REFERENCES `community_theme`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `community_theme_tag_tag_idx` ON `community_theme_tag` (`tag`);--> statement-breakpoint
CREATE TABLE `oauth_app` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`client_id` text NOT NULL,
	`client_secret_hash` text NOT NULL,
	`redirect_uris` text NOT NULL,
	`scopes` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_app_client_id_unique` ON `oauth_app` (`client_id`);--> statement-breakpoint
CREATE TABLE `oauth_authorization_code` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`app_id` text NOT NULL,
	`user_id` text NOT NULL,
	`scopes` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`code_challenge` text,
	`code_challenge_method` text,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `oauth_app`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_authorization_code_code_unique` ON `oauth_authorization_code` (`code`);--> statement-breakpoint
CREATE TABLE `oauth_token` (
	`id` text PRIMARY KEY NOT NULL,
	`access_token_hash` text NOT NULL,
	`refresh_token_hash` text,
	`app_id` text NOT NULL,
	`user_id` text NOT NULL,
	`scopes` text NOT NULL,
	`access_token_expires_at` integer NOT NULL,
	`refresh_token_expires_at` integer,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `oauth_app`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_token_access_token_hash_unique` ON `oauth_token` (`access_token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_token_refresh_token_hash_unique` ON `oauth_token` (`refresh_token_hash`);--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`modifiedAt` integer,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`recurringInterval` text NOT NULL,
	`status` text NOT NULL,
	`currentPeriodStart` integer NOT NULL,
	`currentPeriodEnd` integer NOT NULL,
	`cancelAtPeriodEnd` integer DEFAULT false NOT NULL,
	`canceledAt` integer,
	`startedAt` integer NOT NULL,
	`endsAt` integer,
	`endedAt` integer,
	`customerId` text NOT NULL,
	`productId` text NOT NULL,
	`discountId` text,
	`checkoutId` text NOT NULL,
	`customerCancellationReason` text,
	`customerCancellationComment` text,
	`metadata` text,
	`customFieldData` text,
	`userId` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `theme` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`styles` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `theme_like` (
	`user_id` text NOT NULL,
	`theme_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `theme_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`theme_id`) REFERENCES `community_theme`(`id`) ON UPDATE no action ON DELETE cascade
);
