-- Schedule tables
CREATE TABLE IF NOT EXISTS `schedule_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`activity_code` text NOT NULL,
	`name` text NOT NULL,
	`wbs` text NOT NULL,
	`phase` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`planned_progress` integer DEFAULT 0 NOT NULL,
	`actual_progress` integer DEFAULT 0 NOT NULL,
	`linked_documents` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `schedule_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`source` text NOT NULL,
	`last_sync_at` integer NOT NULL,
	`synced_by` text NOT NULL,
	`project_start` text NOT NULL,
	`project_end` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Databook tables
CREATE TABLE IF NOT EXISTS `databook_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`required_count` integer DEFAULT 0 NOT NULL,
	`collected_count` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `databook_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`document_code` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'missing' NOT NULL,
	`format` text DEFAULT 'PDF',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `databook_sections`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `databook_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`pattern` text NOT NULL,
	`section_id` text NOT NULL,
	`trigger` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `databook_sections`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `databook_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`revision` text NOT NULL,
	`compiler` text NOT NULL,
	`target_date` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
