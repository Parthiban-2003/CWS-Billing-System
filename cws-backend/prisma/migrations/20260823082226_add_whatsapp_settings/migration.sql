-- AlterTable
ALTER TABLE "TenantSetting" ADD COLUMN     "ownerPhone" TEXT,
ADD COLUMN     "whatsappApiKey" TEXT,
ADD COLUMN     "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;
