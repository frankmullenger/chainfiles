-- CreateTable
CREATE TABLE "DigitalProduct" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "filename" VARCHAR(255) NOT NULL,
    "fileKey" VARCHAR(255) NOT NULL,
    "fileSize" INTEGER,
    "mimeType" VARCHAR(100),
    "price" INTEGER NOT NULL,
    "sellerWallet" VARCHAR(42) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_DigitalProduct" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadToken" (
    "id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "productId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "maxDownloads" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_DownloadToken" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigitalProduct_fileKey_key" ON "DigitalProduct"("fileKey");

-- CreateIndex
CREATE INDEX "IX_DigitalProduct_sellerWallet" ON "DigitalProduct"("sellerWallet");

-- CreateIndex
CREATE INDEX "IX_DigitalProduct_createdAt" ON "DigitalProduct"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadToken_token_key" ON "DownloadToken"("token");

-- CreateIndex
CREATE INDEX "IX_DownloadToken_productId" ON "DownloadToken"("productId");

-- CreateIndex
CREATE INDEX "IX_DownloadToken_expiresAt" ON "DownloadToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "DownloadToken" ADD CONSTRAINT "DownloadToken_productId_fkey" FOREIGN KEY ("productId") REFERENCES "DigitalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
