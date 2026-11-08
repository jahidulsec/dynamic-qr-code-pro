-- CreateTable
CREATE TABLE `_QrCodeToQrTag` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_QrCodeToQrTag_AB_unique`(`A`, `B`),
    INDEX `_QrCodeToQrTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_QrCodeToQrTag` ADD CONSTRAINT `_QrCodeToQrTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `qr_code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_QrCodeToQrTag` ADD CONSTRAINT `_QrCodeToQrTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `qr_tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- keep every existing single-tag assignment
INSERT INTO `_QrCodeToQrTag` (`A`, `B`) SELECT `id`, `tagId` FROM `qr_code` WHERE `tagId` IS NOT NULL;

-- DropForeignKey
ALTER TABLE `qr_code` DROP FOREIGN KEY `qr_code_tagId_fkey`;

-- DropIndex
DROP INDEX `qr_code_tagId_idx` ON `qr_code`;

-- AlterTable
ALTER TABLE `qr_code` DROP COLUMN `tagId`;
