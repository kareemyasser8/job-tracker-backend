/*
  Warnings:

  - Added the required column `employmentType` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "employmentType",
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL;
