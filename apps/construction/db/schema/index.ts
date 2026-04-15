/**
 * Database Schema Index
 *
 * This file exports all database schemas for the QUADRA.
 * Organized by domain for better maintainability.
 */

export * from "./documents";
export * from "./notifications";
// EDMS Core Modules
export * from "./projects";
export * from "./transmittals";
// Authentication & Users (from Better Auth + EDMS extensions)
export * from "./users";
export * from "./workflows";

// Note: The original schema.ts file contains Better Auth tables and theme-related tables
// which are kept for backward compatibility and authentication functionality
