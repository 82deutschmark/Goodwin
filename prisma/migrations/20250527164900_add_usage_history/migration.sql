-- CreateTable
CREATE TABLE "UsageHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "UsageHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsageHistory" ADD CONSTRAINT "UsageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update User table to set default credits to 500 if not already set
DO $$
BEGIN
    -- Only run if the column exists and has a different default
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'User' AND column_name = 'credits') THEN
        EXECUTE 'ALTER TABLE "User" ALTER COLUMN "credits" SET DEFAULT 500';
        -- Update existing users with NULL credits to 500
        EXECUTE 'UPDATE "User" SET "credits" = 500 WHERE "credits" IS NULL';
    END IF;
END $$;
