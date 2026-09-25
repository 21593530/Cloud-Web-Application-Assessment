-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "activityType" TEXT,
    "activityId" TEXT,
    "pagePath" TEXT,
    "durationMs" INTEGER,
    "failureCode" TEXT,
    "source" TEXT NOT NULL DEFAULT 'LIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "UsageEvent_eventType_createdAt_idx" ON "UsageEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_activityType_createdAt_idx" ON "UsageEvent"("activityType", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_pagePath_createdAt_idx" ON "UsageEvent"("pagePath", "createdAt");

-- CreateIndex
CREATE INDEX "UsageEvent_source_createdAt_idx" ON "UsageEvent"("source", "createdAt");
