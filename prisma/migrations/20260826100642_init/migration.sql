-- Indexes are declared inline instead of as separate CREATE INDEX statements.
-- CockroachDB v25.2+ creates tables with `schema_locked = true` by default, and
-- a locked table cannot be altered from inside the explicit transaction Prisma
-- wraps a migration in ("cannot automatically unlock the table", SQLSTATE 57000).
-- Declaring the indexes as part of CREATE TABLE means there is no post-create
-- schema change at all, so the migration works on both older and newer clusters.

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('RU', 'EN');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('LANGUAGE', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLING');

-- CreateTable
CREATE TABLE "Profile" (
    "id" STRING NOT NULL,
    "locale" "Locale" NOT NULL,
    "fullName" STRING NOT NULL,
    "title" STRING NOT NULL,
    "summary" STRING NOT NULL,
    "location" STRING NOT NULL,
    "email" STRING NOT NULL,
    "github" STRING NOT NULL,
    "telegram" STRING NOT NULL,
    "websiteUrl" STRING,
    "openToWork" BOOL NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id"),
    UNIQUE INDEX "Profile_locale_key" ("locale")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "level" INT4 NOT NULL,
    "yearsUsed" FLOAT8 NOT NULL,
    "featured" BOOL NOT NULL DEFAULT false,
    "endorsements" INT4 NOT NULL DEFAULT 0,
    "sortOrder" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id"),
    UNIQUE INDEX "Skill_name_key" ("name")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" STRING NOT NULL,
    "locale" "Locale" NOT NULL,
    "company" STRING NOT NULL,
    "role" STRING NOT NULL,
    "description" STRING NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "stack" STRING[],
    "sortOrder" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id"),
    INDEX "Experience_locale_sortOrder_idx" ("locale", "sortOrder")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "stack" STRING[],
    "repoUrl" STRING,
    "liveUrl" STRING,
    "highlight" BOOL NOT NULL DEFAULT false,
    "sortOrder" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    INDEX "Project_locale_sortOrder_idx" ("locale", "sortOrder"),
    UNIQUE INDEX "Project_slug_locale_key" ("slug", "locale")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "message" STRING NOT NULL,
    "ipHash" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id"),
    INDEX "ContactMessage_createdAt_idx" ("createdAt")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" STRING NOT NULL,
    "path" STRING NOT NULL,
    "ipHash" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id"),
    INDEX "PageView_path_createdAt_idx" ("path", "createdAt")
);
