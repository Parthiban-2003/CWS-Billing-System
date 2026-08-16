-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSpent" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TenantSetting" ADD COLUMN     "happyEnd" TEXT,
ADD COLUMN     "happyPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "happyStart" TEXT,
ADD COLUMN     "loyaltyEnabled" BOOLEAN NOT NULL DEFAULT true;
