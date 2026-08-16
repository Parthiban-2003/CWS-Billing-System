-- DropForeignKey
ALTER TABLE "ComboItem" DROP CONSTRAINT "ComboItem_productId_fkey";

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "modifiers" TEXT,
ADD COLUMN     "variantName" TEXT;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
