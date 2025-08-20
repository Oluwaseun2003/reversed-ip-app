-- CreateTable
CREATE TABLE "public"."ReversedIP" (
    "id" TEXT NOT NULL,
    "originalIP" TEXT NOT NULL,
    "reversedIP" TEXT NOT NULL,
    "requestIP" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReversedIP_pkey" PRIMARY KEY ("id")
);
