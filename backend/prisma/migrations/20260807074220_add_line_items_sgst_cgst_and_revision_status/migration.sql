/*
  Warnings:

  - You are about to drop the column `pdfPublicId` on the `bill` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `bill` table. All the data in the column will be lost.
  - You are about to drop the column `items` on the `quote` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bill` DROP COLUMN `pdfPublicId`,
    DROP COLUMN `pdfUrl`;

-- AlterTable
ALTER TABLE `quote` DROP COLUMN `items`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `request` MODIFY `status` ENUM('PENDING', 'QUOTED', 'REVISION_REQUESTED', 'APPROVED', 'BILLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `servicerequest` MODIFY `status` ENUM('PENDING', 'QUOTED', 'REVISION_REQUESTED', 'APPROVED', 'BILLED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `QuoteLineItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quoteId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `gstRate` DOUBLE NOT NULL DEFAULT 18,
    `sgstAmount` DOUBLE NOT NULL,
    `cgstAmount` DOUBLE NOT NULL,
    `lineTotal` DOUBLE NOT NULL,
    `grandTotal` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuoteLineItem` ADD CONSTRAINT `QuoteLineItem_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `Quote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
