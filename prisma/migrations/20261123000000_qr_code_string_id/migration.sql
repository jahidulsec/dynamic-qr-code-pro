-- Change qr_code.id from INT AUTO_INCREMENT to VARCHAR(191) (nanoid).
-- Existing integer ids are kept as their string form ('1', '2', ...).

-- DropForeignKey
ALTER TABLE `_QrCodeToQrTag` DROP FOREIGN KEY `_QrCodeToQrTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `qr_scan` DROP FOREIGN KEY `qr_scan_qrCodeId_fkey`;

-- AlterTable
ALTER TABLE `_QrCodeToQrTag` MODIFY `A` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `qr_code` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `qr_scan` MODIFY `qrCodeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `qr_scan` ADD CONSTRAINT `qr_scan_qrCodeId_fkey` FOREIGN KEY (`qrCodeId`) REFERENCES `qr_code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_QrCodeToQrTag` ADD CONSTRAINT `_QrCodeToQrTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `qr_code`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
