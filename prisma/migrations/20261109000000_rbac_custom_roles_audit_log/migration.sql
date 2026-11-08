-- CreateTable
CREATE TABLE `organization_role` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(64) NOT NULL,
    `permission` TEXT NOT NULL,
    `label` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `organization_role_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `organization_role_organizationId_role_key`(`organizationId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `actorName` VARCHAR(255) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `targetLabel` VARCHAR(255) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_organizationId_createdAt_idx`(`organizationId`, `createdAt`),
    INDEX `audit_log_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `organization_role` ADD CONSTRAINT `organization_role_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

