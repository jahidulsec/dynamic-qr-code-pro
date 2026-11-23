-- Admin access, organization approval and plans/subscriptions (specs 01-04, ticket T-01).
-- Reconstructed on 2026-11-23: the original file was applied to the shared database
-- on 2026-11-08 but never committed. The DDL matches that database exactly.

-- AlterTable
ALTER TABLE `user` ADD COLUMN `banExpires` DATETIME(3) NULL,
    ADD COLUMN `banReason` TEXT NULL,
    ADD COLUMN `banned` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE `session` ADD COLUMN `impersonatedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `organization` ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `statusReason` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `admin_audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `actorName` VARCHAR(255) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `targetType` VARCHAR(32) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `targetLabel` VARCHAR(255) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_audit_log_createdAt_idx`(`createdAt`),
    INDEX `admin_audit_log_targetType_targetId_createdAt_idx`(`targetType`, `targetId`, `createdAt`),
    INDEX `admin_audit_log_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(32) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    `priceMonthly` INTEGER NOT NULL DEFAULT 0,
    `priceYearly` INTEGER NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `maxQrCodes` INTEGER NULL,
    `maxMembers` INTEGER NULL,
    `maxCustomRoles` INTEGER NULL,
    `features` JSON NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` ENUM('TRIALING', 'ACTIVE', 'CANCELED') NOT NULL,
    `interval` ENUM('MONTH', 'YEAR', 'NONE') NOT NULL DEFAULT 'NONE',
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NULL,
    `canceledAt` DATETIME(3) NULL,
    `provider` VARCHAR(32) NOT NULL DEFAULT 'manual',
    `externalId` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_organizationId_key`(`organizationId`),
    UNIQUE INDEX `subscription_externalId_key`(`externalId`),
    INDEX `subscription_planId_idx`(`planId`),
    INDEX `subscription_currentPeriodEnd_idx`(`currentPeriodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `organization_status_createdAt_idx` ON `organization`(`status`, `createdAt`);

-- CreateIndex
CREATE INDEX `organization_reviewedById_idx` ON `organization`(`reviewedById`);

-- AddForeignKey
ALTER TABLE `organization` ADD CONSTRAINT `organization_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_audit_log` ADD CONSTRAINT `admin_audit_log_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: organizations that existed before approval was introduced are approved.
UPDATE `organization` SET `status` = 'ACTIVE', `reviewedAt` = NOW(3);

-- Seed plans with fixed ids (F7). Limits and prices are placeholders; admins edit them later.
-- `legacy` is hidden and holds organizations created before plans existed (F6): it keeps
-- today's 500-code quota and 20 custom roles (MAX_CUSTOM_ROLES), with unlimited members.
INSERT INTO `plan` (`id`, `key`, `name`, `description`, `maxQrCodes`, `maxMembers`, `maxCustomRoles`, `features`, `isDefault`, `isPublic`, `sortOrder`, `updatedAt`) VALUES
    ('plan_free',     'free',     'Free',     NULL, 25,   2,    0,  '{"reports": true, "auditLog": false, "csvExport": false}', true,  true,  0, NOW(3)),
    ('plan_pro',      'pro',      'Pro',      NULL, 500,  10,   5,  '{"reports": true, "auditLog": true, "csvExport": true}',   false, true,  1, NOW(3)),
    ('plan_business', 'business', 'Business', NULL, NULL, NULL, 20, '{"reports": true, "auditLog": true, "csvExport": true}',   false, true,  2, NOW(3)),
    ('plan_legacy',   'legacy',   'Legacy',   'Organizations created before plans were introduced', 500, NULL, 20, '{"reports": true, "auditLog": true, "csvExport": true}', false, false, 3, NOW(3));

-- Backfill: every existing organization gets an open-ended legacy subscription.
INSERT INTO `subscription` (`id`, `organizationId`, `planId`, `status`, `interval`, `currentPeriodStart`, `updatedAt`)
SELECT CONCAT('sub_', `id`), `id`, 'plan_legacy', 'ACTIVE', 'NONE', NOW(3), NOW(3) FROM `organization`;
