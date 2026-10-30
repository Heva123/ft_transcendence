-- Extend the existing role enum used by the mapped Community model.
ALTER TYPE "GroupRole" ADD VALUE 'MODERATOR';

-- Public communities can be discovered and joined without an invitation.
ALTER TABLE "groups"
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- Channel records are intentionally message-agnostic. The chat module can
-- reference channels.id without owning or duplicating community membership.
CREATE TYPE "ChannelType" AS ENUM ('TEXT');

CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChannelType" NOT NULL DEFAULT 'TEXT',
    "communityId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "channels_communityId_name_key"
ON "channels"("communityId", "name");

CREATE INDEX "channels_communityId_idx" ON "channels"("communityId");
CREATE INDEX "channels_createdById_idx" ON "channels"("createdById");

ALTER TABLE "channels"
ADD CONSTRAINT "channels_communityId_fkey"
FOREIGN KEY ("communityId") REFERENCES "groups"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "channels"
ADD CONSTRAINT "channels_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
