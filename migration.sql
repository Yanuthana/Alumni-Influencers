-- ============================================================
-- Migration: Add REST API token columns to users table
-- Run this once in phpMyAdmin or MySQL CLI
-- Database: serverSide
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token            VARCHAR(64)  DEFAULT NULL COMMENT 'Temporary token issued after OTP verified',
    ADD COLUMN IF NOT EXISTS reset_token_expires_at DATETIME     DEFAULT NULL COMMENT 'Expiry for reset_token (15 minutes)',
    ADD COLUMN IF NOT EXISTS api_token              VARCHAR(64)  DEFAULT NULL COMMENT 'Bearer token issued on login (24 hours)',
    ADD COLUMN IF NOT EXISTS api_token_expires_at   DATETIME     DEFAULT NULL COMMENT 'Expiry for api_token';


-- Optional: index for fast lookup on token columns
ALTER TABLE users
    ADD INDEX IF NOT EXISTS idx_api_token   (api_token),
    ADD INDEX IF NOT EXISTS idx_reset_token (reset_token);


-- ============================================================
-- Migration: Add is_winner flag to alumni_profiles
-- Automatically set to 1 when the 6 PM job selects a winner.
-- Run once in phpMyAdmin or MySQL CLI.
-- ============================================================

ALTER TABLE alumni_profiles
    ADD COLUMN IF NOT EXISTS is_winner TINYINT(1) NOT NULL DEFAULT 0
        COMMENT '1 = this alumni is the current active winner; set automatically by the 6 PM job';

-- Optional index for fast winner queries
ALTER TABLE alumni_profiles
    ADD INDEX IF NOT EXISTS idx_is_winner (is_winner);


-- ============================================================
-- Migration: Add rate_limit table
-- Keeps track of IP-based request counts for sensitive endpoints.
-- ============================================================

CREATE TABLE IF NOT EXISTS `rate_limit` (
    `ip_address` VARCHAR(45) NOT NULL,
    `endpoint`   VARCHAR(100) NOT NULL,
    `requests`   INT DEFAULT 1,
    `last_reset` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`ip_address`, `endpoint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
