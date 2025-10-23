-- AlterTable
ALTER TABLE "DownloadToken" ADD COLUMN     "paymentTransactionId" UUID;

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" UUID NOT NULL,
    "transactionHash" VARCHAR(66) NOT NULL,
    "network" VARCHAR(20) NOT NULL,
    "payerAddress" VARCHAR(42) NOT NULL,
    "recipientAddress" VARCHAR(42) NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USDC',
    "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    "blockNumber" INTEGER,
    "gasUsed" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" UUID NOT NULL,

    CONSTRAINT "PK_PaymentTransaction" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_transactionHash_key" ON "PaymentTransaction"("transactionHash");

-- CreateIndex
CREATE INDEX "IX_PaymentTransaction_productId" ON "PaymentTransaction"("productId");

-- CreateIndex
CREATE INDEX "IX_PaymentTransaction_payerAddress" ON "PaymentTransaction"("payerAddress");

-- CreateIndex
CREATE INDEX "IX_PaymentTransaction_transactionHash" ON "PaymentTransaction"("transactionHash");

-- CreateIndex
CREATE INDEX "IX_PaymentTransaction_createdAt" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "IX_DownloadToken_paymentTransactionId" ON "DownloadToken"("paymentTransactionId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "DigitalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
