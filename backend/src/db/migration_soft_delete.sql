-- Migration: Add soft delete support
-- Run this script against an existing database to add soft delete columns
-- Usage: mysql -u root -p stajproje < backend/src/db/migration_soft_delete.sql

-- Add deleted_at column to tables that support soft delete
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE workplaces ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE terminals ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Add indexes for filtering non-deleted records efficiently
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);
CREATE INDEX idx_workplaces_deleted_at ON workplaces(deleted_at);
CREATE INDEX idx_terminals_deleted_at ON terminals(deleted_at);
