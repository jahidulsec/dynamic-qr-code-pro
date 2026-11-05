-- CreateTable
CREATE TABLE `qr_code` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `type` ENUM('WEBSITE') NOT NULL DEFAULT 'WEBSITE',
    `destination` TEXT NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED') NOT NULL DEFAULT 'ACTIVE',
    `style` JSON NULL,
    `expiresAt` DATETIME(3) NULL,
    `scanCount` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qr_code_slug_key`(`slug`),
    INDEX `qr_code_organizationId_deletedAt_createdAt_idx`(`organizationId`, `deletedAt`, `createdAt`),
    INDEX `qr_code_tagId_idx`(`tagId`),
    INDEX `qr_code_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_tag` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `qr_tag_organizationId_name_key`(`organizationId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qr_scan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `qrCodeId` INTEGER NOT NULL,
    `scannedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `visitorHash` CHAR(64) NOT NULL,
    `device` VARCHAR(16) NOT NULL,
    `country` VARCHAR(2) NULL,
    `region` VARCHAR(64) NULL,

    INDEX `qr_scan_qrCodeId_scannedAt_idx`(`qrCodeId`, `scannedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qr_code` ADD CONSTRAINT `qr_code_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code` ADD CONSTRAINT `qr_code_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_code` ADD CONSTRAINT `qr_code_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `qr_tag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_tag` ADD CONSTRAINT `qr_tag_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qr_scan` ADD CONSTRAINT `qr_scan_qrCodeId_fkey` FOREIGN KEY (`qrCodeId`) REFERENCES `qr_code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
