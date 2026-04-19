CREATE TABLE `letter_related_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`letter_id` text NOT NULL,
	`document_code` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`letter_id`) REFERENCES `letters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `letters` (
	`id` text PRIMARY KEY NOT NULL,
	`letter_number` text NOT NULL,
	`date` integer NOT NULL,
	`direction` text NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`to_type` text NOT NULL,
	`subject` text NOT NULL,
	`category` text NOT NULL,
	`ref` text,
	`author` text NOT NULL,
	`attachments` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`urgent` integer DEFAULT false NOT NULL,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `letters_letter_number_unique` ON `letters` (`letter_number`);--> statement-breakpoint
CREATE TABLE `memos` (
	`id` text PRIMARY KEY NOT NULL,
	`memo_number` text NOT NULL,
	`date` integer NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`urgent` integer DEFAULT false NOT NULL,
	`status` text NOT NULL,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memos_memo_number_unique` ON `memos` (`memo_number`);--> statement-breakpoint
CREATE TABLE `minutes_of_meeting` (
	`id` text PRIMARY KEY NOT NULL,
	`mom_number` text NOT NULL,
	`meeting_date` integer NOT NULL,
	`issued_date` integer NOT NULL,
	`meeting_type` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`chairperson` text NOT NULL,
	`minute_taker` text NOT NULL,
	`agenda` text NOT NULL,
	`decisions` text NOT NULL,
	`next_meeting` integer,
	`status` text NOT NULL,
	`distribution` text NOT NULL,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`minute_taker`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `minutes_of_meeting_mom_number_unique` ON `minutes_of_meeting` (`mom_number`);--> statement-breakpoint
CREATE TABLE `mom_action_items` (
	`id` text PRIMARY KEY NOT NULL,
	`mom_id` text NOT NULL,
	`item` text NOT NULL,
	`assigned_to` text NOT NULL,
	`due_date` integer,
	`status` text DEFAULT 'Open' NOT NULL,
	`completed_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`mom_id`) REFERENCES `minutes_of_meeting`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mom_attendees` (
	`id` text PRIMARY KEY NOT NULL,
	`mom_id` text NOT NULL,
	`name` text NOT NULL,
	`organization` text NOT NULL,
	`role` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`mom_id`) REFERENCES `minutes_of_meeting`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `incoming_transmittal_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`transmittal_id` text NOT NULL,
	`document_code` text NOT NULL,
	`title` text NOT NULL,
	`revision` text NOT NULL,
	`status` text NOT NULL,
	`our_action` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`transmittal_id`) REFERENCES `incoming_transmittals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `incoming_transmittals` (
	`id` text PRIMARY KEY NOT NULL,
	`transmittal_number` text NOT NULL,
	`date` integer NOT NULL,
	`received_date` integer NOT NULL,
	`from` text NOT NULL,
	`from_org` text NOT NULL,
	`subject` text NOT NULL,
	`purpose` text NOT NULL,
	`their_ref` text,
	`response_required` integer DEFAULT false NOT NULL,
	`response_due` integer,
	`response_status` text NOT NULL,
	`assigned_to` text,
	`priority` text NOT NULL,
	`notes` text,
	`attachments` integer DEFAULT 0 NOT NULL,
	`response_by` text,
	`response_date` integer,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`response_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `query_linked_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`query_id` text NOT NULL,
	`query_type` text NOT NULL,
	`document_code` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rfis` (
	`id` text PRIMARY KEY NOT NULL,
	`rfi_number` text NOT NULL,
	`date` integer NOT NULL,
	`raised_by` text NOT NULL,
	`from` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`assigned_to` text NOT NULL,
	`due_date` integer,
	`response_date` integer,
	`response` text,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rfis_rfi_number_unique` ON `rfis` (`rfi_number`);--> statement-breakpoint
CREATE TABLE `site_tech_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`query_number` text NOT NULL,
	`date` integer NOT NULL,
	`raised_by` text NOT NULL,
	`discipline` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`assigned_to` text NOT NULL,
	`due_date` integer,
	`response_date` integer,
	`response` text,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_tech_queries_query_number_unique` ON `site_tech_queries` (`query_number`);--> statement-breakpoint
CREATE TABLE `technical_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`query_number` text NOT NULL,
	`date` integer NOT NULL,
	`raised_by` text NOT NULL,
	`discipline` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`assigned_to` text NOT NULL,
	`due_date` integer,
	`response_date` integer,
	`response` text,
	`project_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`raised_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `technical_queries_query_number_unique` ON `technical_queries` (`query_number`);