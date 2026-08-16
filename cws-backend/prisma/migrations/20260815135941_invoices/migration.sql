/*
  Warnings:

  - You are about to alter the column `qty` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,3)` to `Integer`.

*/
-- DropIndex
DROP INDEX "Invoice_tenantId_number_key";

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "qty" SET DATA TYPE INTEGER;
