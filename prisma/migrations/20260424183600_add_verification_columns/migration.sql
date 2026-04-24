-- AlterTable: Add email verification columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationTokenExpires" TIMESTAMP(3);

-- CreateIndex: Unique constraint on verificationToken
CREATE UNIQUE INDEX IF NOT EXISTS "users_verificationToken_key" ON "users"("verificationToken");
