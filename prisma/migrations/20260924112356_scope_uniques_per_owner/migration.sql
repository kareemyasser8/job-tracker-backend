/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,domain]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,name]` on the table `Source` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,name]` on the table `Technology` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Company_domain_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "Technology_name_key";

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "ApplicationNote_applicationId_idx" ON "ApplicationNote"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_domain_key" ON "Company"("ownerId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "Role_ownerId_name_key" ON "Role"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Source_ownerId_name_key" ON "Source"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_ownerId_name_key" ON "Technology"("ownerId", "name");
