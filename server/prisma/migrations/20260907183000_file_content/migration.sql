-- Persist upload bytes so downloads survive ephemeral disks (Railway).
ALTER TABLE `files` ADD COLUMN `content` LONGBLOB NULL;
