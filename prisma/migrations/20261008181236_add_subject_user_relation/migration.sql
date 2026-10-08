-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "Subject_userId_idx" ON "Subject"("userId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
