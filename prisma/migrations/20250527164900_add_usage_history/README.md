# Add Usage History

This migration adds support for tracking API usage history and sets default credits to 500 for all users.

## Changes

1. Created `UsageHistory` table to track:
   - User ID
   - Operation type
   - Credits used
   - Timestamp
   - Additional details (JSON)
   - Success/failure status
   - Error message (if any)

2. Updated `User` table:
   - Set default credits to 500
   - Updated existing NULL credits to 500

## How to Apply

1. Run the migration:
   ```bash
   npx prisma migrate deploy
   ```

2. Verify the changes in your database:
   - Check that the `UsageHistory` table exists
   - Verify default credits are set to 500 for all users
