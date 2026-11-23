-- QR links are <base>/q/<id>; the custom alias is gone.

-- DropIndex
DROP INDEX `qr_code_slug_key` ON `qr_code`;

-- AlterTable
ALTER TABLE `qr_code` DROP COLUMN `slug`;

