-- DAS & CO database
-- Backup exported 2026-10-01T06:39:38.397Z
-- Import this file in Hostinger phpMyAdmin.
-- It replaces business tables. Existing login accounts are kept.
-- If the email below does not exist yet, this creates it.
-- Login email: sandeepdas6699@gmail.com
-- Login password: Dasandco@2026

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`name`, `email`, `password`, `role`)
SELECT 'Sandeep Das', 'sandeepdas6699@gmail.com', '$2a$10$OKXZf8kuFlE/n2bg8FkR6O8hIS5.KXt60JeHf5kedhtSp7hLXMJi.', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM `users` WHERE `email` = 'sandeepdas6699@gmail.com'
);

DROP TABLE IF EXISTS `gold_transactions`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `business_settings`;

CREATE TABLE `clients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `client_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `company` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NULL,
  `default_percentage` DECIMAL(6,3) NOT NULL DEFAULT 2,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `client_id` INT NULL,
  `order_number` VARCHAR(100) NULL,
  `project_name` VARCHAR(255) NULL,
  `category` VARCHAR(50) NULL,
  `gold_weight` DECIMAL(12,3) NULL,
  `percentage` DECIMAL(8,3) NULL,
  `earning_gold` DECIMAL(12,3) NULL,
  `ornament_name` VARCHAR(255) NULL,
  `gross_weight` DECIMAL(12,3) NULL,
  `stone_weight` DECIMAL(12,3) NULL,
  `net_gold_weight` DECIMAL(12,3) NULL,
  `wastage_percent` DECIMAL(8,3) NULL,
  `labour_charge` DECIMAL(12,2) NULL,
  `gold_earned` DECIMAL(12,3) NULL,
  `delivery_date` DATE NULL,
  `status` VARCHAR(50) NULL,
  `created_at` DATETIME NULL,
  `gold_deducted` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `expenses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `expense_name` VARCHAR(255) NULL,
  `vendor` VARCHAR(255) NULL,
  `invoice_number` VARCHAR(255) NULL,
  `status` VARCHAR(50) NULL,
  `category` VARCHAR(100) NULL,
  `amount` DECIMAL(12,2) NULL,
  `gold_given` DECIMAL(12,3) NULL,
  `gold_returned` DECIMAL(12,3) NULL,
  `gold_loss` DECIMAL(12,3) NULL,
  `remarks` TEXT NULL,
  `expense_date` DATE NULL,
  `created_at` DATETIME NULL,
  `client_id` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `gold_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `transaction_type` VARCHAR(50) NULL,
  `reference` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_by` VARCHAR(255) NULL,
  `gold_added` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `gold_deducted` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `balance_after` DECIMAL(12,3) NULL,
  `remarks` TEXT NULL,
  `order_id` INT NULL,
  `transaction_date` DATE NULL,
  `created_at` DATETIME NULL,
  `expense_id` INT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `business_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `opening_gold_balance` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `company_name` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `rate_22k` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `business_name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `default_percentage` DECIMAL(6,3) NOT NULL DEFAULT 2,
  `rate_24k` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `rate_18k` DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clients` (`id`, `client_name`, `phone`, `email`, `company`, `notes`, `created_at`, `default_percentage`) VALUES
(29, 'ROCKY KAKA', NULL, NULL, NULL, NULL, '2026-09-21 05:56:41', 2),
(30, 'SANU KARMAKAR', NULL, NULL, NULL, NULL, '2026-09-21 05:56:50', 2),
(31, 'TAPAS KARMAKAR', NULL, NULL, NULL, NULL, '2026-09-21 05:56:58', 2),
(32, 'MODHON SET', NULL, NULL, NULL, NULL, '2026-09-21 05:57:11', 2),
(33, 'MOHAN', NULL, NULL, NULL, NULL, '2026-09-21 05:57:18', 2),
(34, 'BRAHMAJI', NULL, NULL, NULL, NULL, '2026-09-21 05:57:34', 3),
(35, 'RGV', NULL, NULL, NULL, NULL, '2026-09-21 05:57:49', 2.7),
(36, 'SUROJIT DA', NULL, NULL, NULL, NULL, '2026-09-21 06:25:21', 2),
(37, 'BHASKAR RAO', NULL, NULL, NULL, NULL, '2026-09-22 15:07:36', 2),
(38, 'AJHAR CASTING', NULL, NULL, NULL, NULL, '2026-09-23 06:03:41', 2);

INSERT INTO `orders` (`id`, `client_id`, `order_number`, `project_name`, `category`, `gold_weight`, `percentage`, `earning_gold`, `ornament_name`, `gross_weight`, `stone_weight`, `net_gold_weight`, `wastage_percent`, `labour_charge`, `gold_earned`, `delivery_date`, `status`, `created_at`, `gold_deducted`, `notes`, `completed_at`) VALUES
(76, 35, 'DC-70325417', NULL, 'Custom', 0, 2, 0, 'COUPLE RINGS', 8, 0, 8, 2.7, 0, 0.216, '2026-09-21', 'Delivered', '2026-09-21 05:58:45', 1, NULL, '2026-09-22 14:12:18'),
(77, 31, 'DC-70364615', NULL, 'Custom', 0, 2, 0, 'SARIPIN', 9, 0, 9, 2, 0, 0.18, '2026-09-21', 'Delivered', '2026-09-21 05:59:24', 1, NULL, '2026-09-22 14:12:28'),
(78, 31, 'DC-70404600', NULL, 'Custom', 0, 2, 0, 'TOPS', 3.4, 0, 3.4, 2, 0, 0.068, '2026-09-21', 'Delivered', '2026-09-21 06:00:04', 1, NULL, '2026-09-22 14:12:12'),
(79, 31, 'DC-70417576', NULL, 'Custom', 0, 2, 0, 'LOCKET', 4.5, 0, 4.5, 2, 0, 0.09, '2026-09-21', 'Delivered', '2026-09-21 06:00:17', 1, NULL, '2026-09-22 14:12:51'),
(80, 29, 'DC-70474867', NULL, 'Custom', 0, 2, 0, 'LOCKET', 7.3, 0, 7.3, 2, 0, 0.146, '2026-09-21', 'Delivered', '2026-09-21 06:01:14', 1, NULL, '2026-09-25 12:41:18'),
(81, 32, 'DC-70531049', NULL, 'Custom', 0, 2, 0, 'BALAJI NAMAM NOK', 15, 0, 15, 2, 0, 0.3, '2026-09-21', 'Delivered', '2026-09-21 06:02:11', 1, NULL, '2026-09-24 11:54:01'),
(82, 34, 'DC-70620341', NULL, 'Custom', 0, 2, 0, 'LOCKET', 7.5, 0, 7.5, 3, 0, 0.225, '2026-09-21', 'Delivered', '2026-09-21 06:03:40', 1, NULL, '2026-09-29 07:39:29'),
(83, 34, 'DC-70633428', NULL, 'Custom', 0, 2, 0, 'LOCKET COCONUT', 6, 0, 6, 3, 0, 0.18, '2026-09-21', 'Delivered', '2026-09-21 06:03:53', 1, NULL, '2026-09-28 16:20:13'),
(84, 34, 'DC-70662514', NULL, 'Custom', 0, 2, 0, 'LOCKET GANESH AYYAPPA MURUGA', 6, 0, 6, 3, 0, 0.18, '2026-09-21', 'In Progress', '2026-09-21 06:04:22', 0, NULL, NULL),
(85, 36, 'DC-71936170', NULL, 'Custom', 0, 2, 0, 'LOCKET', 8, 0, 8, 2, 0, 0.16, '2026-09-21', 'Delivered', '2026-09-21 06:25:36', 1, NULL, '2026-09-29 07:39:13'),
(86, 36, 'DC-71947884', NULL, 'Custom', 0, 2, 0, 'CHAINBILLA', 2.5, 0, 2.5, 2, 0, 0.05, '2026-09-21', 'Delivered', '2026-09-21 06:25:47', 1, NULL, '2026-09-23 07:56:55'),
(87, 30, 'DC-72026061', NULL, 'Custom', 0, 2, 0, 'BRACELET', 8, 0, 8, 0.8, 0, 0.064, '2026-09-21', 'Delivered', '2026-09-21 06:27:06', 1, NULL, '2026-09-22 14:12:03'),
(88, 33, 'DC-72059047', NULL, 'Custom', 0, 2, 0, 'LAKHSMI RING', 4, 0, 4, 2, 0, 0.08, '2026-09-21', 'Delivered', '2026-09-21 06:27:39', 1, NULL, '2026-09-22 14:13:11'),
(89, 33, 'DC-72082449', NULL, 'Custom', 0, 2, 0, 'TADUBILLA', 4, 0, 4, 2, 0, 0.08, '2026-09-21', 'Delivered', '2026-09-21 06:28:02', 1, NULL, '2026-09-22 14:13:05'),
(90, 29, 'DC-89384939', NULL, 'Custom', 0, 2, 0, 'SM LOCKET', 4.3, 0, 4.3, 2, 0, 0.086, '2026-09-22', 'Delivered', '2026-09-22 15:03:05', 1, NULL, '2026-09-24 14:57:57'),
(91, 29, 'DC-89401161', NULL, 'Custom', 0, 2, 0, 'BALAJI RING', 4.5, 0, 4.5, 2, 0, 0.09, '2026-09-22', 'Delivered', '2026-09-22 15:03:21', 1, NULL, '2026-09-28 16:19:57'),
(92, 29, 'DC-89424276', NULL, 'Custom', 0, 2, 0, 'GREEN STONE RING', 5.4, 0, 5.4, 2, 0, 0.108, '2026-09-22', 'Delivered', '2026-09-22 15:03:44', 1, NULL, '2026-09-24 14:58:11'),
(93, 29, 'DC-89442858', NULL, 'Custom', 0, 2, 0, 'LAKHSMI LOCKET', 5, 0, 5, 2, 0, 0.1, '2026-09-22', 'Delivered', '2026-09-22 15:04:02', 1, NULL, '2026-09-24 14:57:52'),
(94, 29, 'DC-89456918', NULL, 'Custom', 0, 2, 0, 'ELEPHAANT', 24, 0, 24, 2, 0, 0.48, '2026-09-22', 'Delivered', '2026-09-22 15:04:17', 1, NULL, '2026-09-25 12:41:09'),
(95, 29, 'DC-89482286', NULL, 'Custom', 0, 2, 0, 'BRASLET', 4, 0, 4, 2, 0, 0.08, '2026-09-22', 'Delivered', '2026-09-22 15:04:42', 1, NULL, '2026-09-25 12:41:04'),
(96, 29, 'DC-89500953', NULL, 'Custom', 0, 2, 0, 'COUPLE RINGS', 7, 0, 7, 2, 0, 0.14, '2026-09-22', 'Delivered', '2026-09-22 15:05:01', 1, NULL, '2026-09-25 12:32:43'),
(97, 29, 'DC-89515655', NULL, 'Custom', 0, 2, 0, 'HANGINGS', 9.2, 0, 9.2, 2, 0, 0.184, '2026-09-22', 'In Progress', '2026-09-22 15:05:15', 0, NULL, NULL),
(98, 29, 'DC-89541230', NULL, 'Custom', 0, 2, 0, 'BALAJI RING REP', 10.5, 0, 10.5, 0.8, 0, 0.084, '2026-09-22', 'Delivered', '2026-09-22 15:05:41', 1, NULL, '2026-09-24 14:57:38'),
(99, 29, 'DC-89559888', NULL, 'Custom', 0, 2, 0, 'BELT', 32, 0, 32, 0.8, 0, 0.256, '2026-09-22', 'Delivered', '2026-09-22 15:05:59', 1, NULL, '2026-09-28 16:19:36'),
(100, 30, 'DC-89591548', NULL, 'Custom', 0, 2, 0, 'RING', 8, 0, 8, 2, 0, 0.16, '2026-09-22', 'Delivered', '2026-09-22 15:06:31', 1, NULL, '2026-09-23 07:57:09'),
(101, 30, 'DC-89605859', NULL, 'Custom', 0, 2, 0, 'GANESH LOCKET', 5, 0, 5, 2, 0, 0.1, '2026-09-22', 'Delivered', '2026-09-22 15:06:45', 1, NULL, '2026-09-23 11:54:13'),
(102, 37, 'DC-89681542', NULL, 'Custom', 0, 2, 0, 'BALAJI RING', 8.5, 0, 8.5, 3, 0, 0.255, '2026-09-22', 'Delivered', '2026-09-22 15:08:01', 1, NULL, '2026-09-23 07:57:04'),
(103, 30, 'DC-73872918', NULL, 'Custom', 0, 2, 0, 'tops', 3.2, 0, 3.2, 2, 0, 0.064, '2026-09-23', 'Delivered', '2026-09-23 14:31:13', 1, NULL, '2026-09-24 11:53:45'),
(104, 35, 'DC-04476355', NULL, 'Custom', 0, 2, 0, 'locket', 4, 0, 4, 2.7, 0, 0.108, '2026-09-26', 'Delivered', '2026-09-26 06:34:36', 1, NULL, '2026-09-30 05:47:21'),
(106, 33, 'DC-04530313', NULL, 'Custom', 0, 2, 0, 'bracelet', 3.5, 0, 3.5, 2, 0, 0.07, '2026-09-26', 'Delivered', '2026-09-26 06:35:30', 1, NULL, '2026-09-27 15:38:22'),
(107, 33, 'DC-04551812', NULL, 'Custom', 0, 2, 0, 'lockets 3 pieces', 4.5, 0, 4.5, 2, 0, 0.09, '2026-09-26', 'Delivered', '2026-09-26 06:35:51', 1, NULL, '2026-09-27 15:38:11'),
(108, 33, 'DC-04576353', NULL, 'Custom', 0, 2, 0, 'M ring', 6.5, 0, 6.5, 2, 0, 0.13, '2026-09-26', 'Delivered', '2026-09-26 06:36:16', 1, NULL, '2026-09-30 05:47:13'),
(109, 33, 'DC-04598767', NULL, 'Custom', 0, 2, 0, 'balaji ring', 4.2, 0, 4.2, 0.8, 0, 0.034, '2026-09-26', 'Delivered', '2026-09-26 06:36:38', 1, NULL, '2026-09-27 06:59:30'),
(110, 33, 'DC-04624752', NULL, 'Custom', 0, 2, 0, 'v letter ring', 4, 0, 4, 2, 0, 0.08, '2026-09-26', 'Delivered', '2026-09-26 06:37:04', 1, NULL, '2026-09-27 15:37:51'),
(111, 33, 'DC-04659600', NULL, 'Custom', 0, 2, 0, 'elephant ring', 4.4, 0, 4.4, 2, 0, 0.088, '2026-09-26', 'Delivered', '2026-09-26 06:37:39', 1, NULL, '2026-09-27 15:37:34'),
(112, 33, 'DC-04716152', NULL, 'Custom', 0, 2, 0, 's ring', 3.5, 0, 3.5, 2, 0, 0.07, '2026-09-26', 'Delivered', '2026-09-26 06:38:36', 1, NULL, '2026-09-27 15:37:45'),
(113, 33, 'DC-04751071', NULL, 'Custom', 0, 2, 0, 'stone ring 1', 3, 0, 3, 2, 0, 0.06, '2026-09-26', 'Delivered', '2026-09-26 06:39:11', 1, NULL, '2026-09-27 06:58:08'),
(114, 33, 'DC-04763501', NULL, 'Custom', 0, 2, 0, 'stone ring 2', 3, 0, 3, 2, 0, 0.06, '2026-09-26', 'Delivered', '2026-09-26 06:39:23', 1, NULL, '2026-09-27 06:58:02'),
(115, 32, 'DC-04808591', NULL, 'Custom', 0, 2, 0, 'bracelet', 12, 0, 12, 2, 0, 0.24, '2026-09-26', 'Pending', '2026-09-26 06:40:08', 0, NULL, NULL),
(116, 33, 'DC-30341732', NULL, 'Custom', 0, 2, 0, 'ring', 4, 0, 4, 2, 0, 0.08, '2026-09-26', 'Delivered', '2026-09-26 13:45:41', 1, NULL, '2026-09-27 06:57:57'),
(117, 35, 'DC-92393749', NULL, 'Custom', 0, 2, 0, 'bangle 4 pes', 46, 0, 46, 2.7, 0, 1.242, '2026-09-27', 'In Progress', '2026-09-27 06:59:53', 0, NULL, NULL),
(118, 35, 'DC-92416094', NULL, 'Custom', 0, 2, 0, 'father child ring', 8, 0, 8, 2.7, 0, 0.216, '2026-09-27', 'Pending', '2026-09-27 07:00:16', 0, NULL, NULL),
(119, 30, 'DC-92484435', NULL, 'Custom', 0, 2, 0, 'locket repair', 5, 0, 5, 0.8, 0, 0.04, '2026-09-27', 'Delivered', '2026-09-27 07:01:24', 1, NULL, '2026-09-27 15:38:32'),
(120, 29, 'DC-92542576', NULL, 'Custom', 0, 2, 0, 'balaji stone ring', 10.5, 0, 10.5, 2, 0, 0.21, '2026-09-27', 'Pending', '2026-09-27 07:02:22', 0, NULL, NULL),
(121, 29, 'DC-92559751', NULL, 'Custom', 0, 2, 0, 'balaji locket', 6.3, 0, 6.3, 2, 0, 0.126, '2026-09-27', 'Delivered', '2026-09-27 07:02:39', 1, NULL, '2026-09-30 15:14:58'),
(122, 29, 'DC-92599055', NULL, 'Custom', 0, 2, 0, 'gents ring rocky kk hand', 4.4, 0, 4.4, 2, 0, 0.088, '2026-09-27', 'Delivered', '2026-09-27 07:03:19', 1, NULL, '2026-09-30 15:15:17'),
(123, 29, 'DC-82757387', NULL, 'Custom', 0, 2, 0, 'BALAJI RING', 5, 0, 5, 0.8, 0, 0.04, '2026-09-28', 'Delivered', '2026-09-28 08:05:57', 1, NULL, '2026-09-29 07:38:32'),
(124, 33, 'DC-82778360', NULL, 'Custom', 0, 2, 0, 'LAKHSMI BALAJI RING', 10, 0, 10, 2, 0, 0.2, '2026-09-28', 'Delivered', '2026-09-28 08:06:18', 1, NULL, '2026-09-30 05:46:50'),
(125, 30, 'DC-12596907', NULL, 'Custom', 0, 2, 0, 'balaji ring', 10, 0, 10, 2, 0, 0.2, '2026-09-28', 'Delivered', '2026-09-28 16:23:17', 1, NULL, '2026-09-30 15:14:51'),
(126, 29, 'DC-12638850', NULL, 'Custom', 0, 2, 0, 'tadubilla', 4, 0, 4, 2, 0, 0.08, '2026-09-28', 'Pending', '2026-09-28 16:23:58', 0, NULL, NULL),
(127, 29, 'DC-12673263', NULL, 'Custom', 0, 2, 0, 'balaji ring stones 8.4+12.4', 20, 0, 20, 0.8, 0, 0.16, '2026-09-28', 'Delivered', '2026-09-28 16:24:33', 1, NULL, '2026-09-29 07:37:18'),
(128, 30, 'DC-12706059', NULL, 'Custom', 0, 2, 0, 'ring', 1, 0, 1, 2, 0, 0.02, '2026-09-28', 'Delivered', '2026-09-28 16:25:06', 1, NULL, '2026-09-30 05:46:32'),
(129, 33, 'DC-67542695', NULL, 'Custom', 0, 2, 0, 'lakhsmi ji ring repair', 8, 0, 8, 0.8, 0, 0.064, '2026-09-29', 'Pending', '2026-09-29 07:39:02', 0, NULL, NULL),
(130, 29, 'DC-67597143', NULL, 'Custom', 0, 2, 0, 'haar+jhumka', 112, 0, 112, 2, 0, 2.24, '2026-09-29', 'Pending', '2026-09-29 07:39:57', 0, NULL, NULL),
(131, 36, 'DC-91070305', NULL, 'Custom', 0, 2, 0, 'anki ring', 4.8, 0, 4.8, 2, 0, 0.096, '2026-09-29', 'Delivered', '2026-09-29 14:11:10', 1, NULL, '2026-09-30 05:46:39'),
(132, 33, 'DC-56271266', NULL, 'Custom', 0, 2, 0, 'rings 4', 40, 0, 40, 2, 0, 0.8, '2026-09-30', 'Pending', '2026-09-30 08:17:55', 0, NULL, NULL),
(133, 33, 'DC-56296575', NULL, 'Custom', 0, 2, 0, 'moonga stone ring', 4.5, 0, 4.5, 2, 0, 0.09, '2026-09-30', 'Delivered', '2026-09-30 08:18:16', 1, NULL, NULL),
(134, 29, 'DC-86684225', NULL, 'Custom', 0, 2, 0, 'moti ring repair', 3, 0, 3, 2, 0, 0.06, '2026-09-30', 'Pending', '2026-09-30 16:44:46', 0, NULL, NULL);

INSERT INTO `expenses` (`id`, `expense_name`, `vendor`, `invoice_number`, `status`, `category`, `amount`, `gold_given`, `gold_returned`, `gold_loss`, `remarks`, `expense_date`, `created_at`, `client_id`) VALUES
(16, 'Casting', NULL, NULL, 'Pending', 'Casting', 0, 41.38, 41.13, 0.25, NULL, '2026-09-23', '2026-09-23 06:03:54', 38);

INSERT INTO `gold_transactions` (`id`, `transaction_type`, `reference`, `notes`, `created_by`, `gold_added`, `gold_deducted`, `balance_after`, `remarks`, `order_id`, `transaction_date`, `created_at`, `expense_id`) VALUES
(66, NULL, 'DC-72026061', NULL, NULL, 0.064, 0, 50.064, 'Gold earned from completed order', 87, '2026-09-22', '2026-09-22 14:12:04', NULL),
(67, NULL, 'DC-70404600', NULL, NULL, 0.068, 0, 50.132, 'Gold earned from completed order', 78, '2026-09-22', '2026-09-22 14:12:13', NULL),
(68, NULL, 'DC-70325417', NULL, NULL, 0.216, 0, 50.348, 'Gold earned from completed order', 76, '2026-09-22', '2026-09-22 14:12:19', NULL),
(69, NULL, 'DC-70364615', NULL, NULL, 0.18, 0, 50.528, 'Gold earned from completed order', 77, '2026-09-22', '2026-09-22 14:12:29', NULL),
(70, NULL, 'DC-70417576', NULL, NULL, 0.09, 0, 50.618, 'Gold earned from completed order', 79, '2026-09-22', '2026-09-22 14:12:52', NULL),
(71, NULL, 'DC-72082449', NULL, NULL, 0.08, 0, 50.698, 'Gold earned from completed order', 89, '2026-09-22', '2026-09-22 14:13:06', NULL),
(72, NULL, 'DC-72059047', NULL, NULL, 0.08, 0, 50.778, 'Gold earned from completed order', 88, '2026-09-22', '2026-09-22 14:13:12', NULL),
(74, NULL, 'DC-71947884', NULL, NULL, 0.05, 0, 50.708, 'Gold earned from completed order', 86, '2026-09-23', '2026-09-23 07:56:56', NULL),
(75, NULL, 'DC-89681542', NULL, NULL, 0.255, 0, 50.963, 'Gold earned from completed order', 102, '2026-09-23', '2026-09-23 07:57:04', NULL),
(76, NULL, 'DC-89591548', NULL, NULL, 0.16, 0, 51.123, 'Gold earned from completed order', 100, '2026-09-23', '2026-09-23 07:57:10', NULL),
(77, NULL, 'DC-89605859', NULL, NULL, 0.1, 0, 51.223, 'Gold earned from completed order', 101, '2026-09-23', '2026-09-23 11:52:25', NULL),
(78, 'ADD', NULL, NULL, NULL, 4.68, 0, 55.903, 'sanu loss
', NULL, '2026-09-24', '2026-09-24 08:03:53', NULL),
(79, NULL, 'DC-73872918', NULL, NULL, 0.064, 0, 55.967, 'Gold earned from completed order', 103, '2026-09-24', '2026-09-24 11:53:46', NULL),
(80, NULL, 'DC-70531049', NULL, NULL, 0.3, 0, 56.267, 'Gold earned from completed order', 81, '2026-09-24', '2026-09-24 11:54:02', NULL),
(81, NULL, NULL, NULL, NULL, 0, 0.25, 56.017, 'Casting loss · Casting', NULL, '2026-09-23', '2026-09-24 11:54:54', 16),
(82, NULL, 'DC-89541230', NULL, NULL, 0.084, 0, 56.101, 'Gold earned from completed order', 98, '2026-09-24', '2026-09-24 14:57:39', NULL),
(83, NULL, 'DC-89442858', NULL, NULL, 0.1, 0, 56.201, 'Gold earned from completed order', 93, '2026-09-24', '2026-09-24 14:57:53', NULL),
(84, NULL, 'DC-89384939', NULL, NULL, 0.086, 0, 56.287, 'Gold earned from completed order', 90, '2026-09-24', '2026-09-24 14:57:58', NULL),
(85, NULL, 'DC-89424276', NULL, NULL, 0.108, 0, 56.395, 'Gold earned from completed order', 92, '2026-09-24', '2026-09-24 14:58:12', NULL),
(86, NULL, 'DC-89500953', NULL, NULL, 0.14, 0, 56.535, 'Gold earned from completed order', 96, '2026-09-25', '2026-09-25 12:32:44', NULL),
(87, NULL, 'DC-89482286', NULL, NULL, 0.08, 0, 56.615, 'Gold earned from completed order', 95, '2026-09-25', '2026-09-25 12:41:05', NULL),
(88, NULL, 'DC-89456918', NULL, NULL, 0.48, 0, 57.095, 'Gold earned from completed order', 94, '2026-09-25', '2026-09-25 12:41:10', NULL),
(89, NULL, 'DC-70474867', NULL, NULL, 0.146, 0, 57.241, 'Gold earned from completed order', 80, '2026-09-25', '2026-09-25 12:41:19', NULL),
(90, NULL, 'DC-30341732', NULL, NULL, 0.08, 0, 57.321, 'Gold earned from completed order', 116, '2026-09-27', '2026-09-27 06:57:58', NULL),
(91, NULL, 'DC-04763501', NULL, NULL, 0.06, 0, 57.381, 'Gold earned from completed order', 114, '2026-09-27', '2026-09-27 06:58:04', NULL),
(92, NULL, 'DC-04751071', NULL, NULL, 0.06, 0, 57.441, 'Gold earned from completed order', 113, '2026-09-27', '2026-09-27 06:58:09', NULL),
(93, NULL, 'DC-04598767', NULL, NULL, 0.034, 0, 57.475, 'Gold earned from completed order', 109, '2026-09-27', '2026-09-27 06:59:31', NULL),
(94, NULL, 'DC-04659600', NULL, NULL, 0.088, 0, 57.563, 'Gold earned from completed order', 111, '2026-09-27', '2026-09-27 15:37:35', NULL),
(95, NULL, 'DC-04716152', NULL, NULL, 0.07, 0, 57.633, 'Gold earned from completed order', 112, '2026-09-27', '2026-09-27 15:37:46', NULL),
(96, NULL, 'DC-04624752', NULL, NULL, 0.08, 0, 57.713, 'Gold earned from completed order', 110, '2026-09-27', '2026-09-27 15:37:52', NULL),
(97, NULL, 'DC-04551812', NULL, NULL, 0.09, 0, 57.803, 'Gold earned from completed order', 107, '2026-09-27', '2026-09-27 15:38:12', NULL),
(98, NULL, 'DC-04530313', NULL, NULL, 0.07, 0, 57.873, 'Gold earned from completed order', 106, '2026-09-27', '2026-09-27 15:38:23', NULL),
(99, NULL, 'DC-92484435', NULL, NULL, 0.04, 0, 57.913, 'Gold earned from completed order', 119, '2026-09-27', '2026-09-27 15:38:33', NULL),
(100, 'ADD', NULL, NULL, NULL, 2.3, 0, 60.213, NULL, NULL, '2026-09-28', '2026-09-28 08:03:40', NULL),
(101, NULL, 'DC-89559888', NULL, NULL, 0.256, 0, 60.469, 'Gold earned from completed order', 99, '2026-09-28', '2026-09-28 16:19:37', NULL),
(102, NULL, 'DC-89401161', NULL, NULL, 0.09, 0, 60.559, 'Gold earned from completed order', 91, '2026-09-28', '2026-09-28 16:19:58', NULL),
(103, NULL, 'DC-70633428', NULL, NULL, 0.18, 0, 60.739, 'Gold earned from completed order', 83, '2026-09-28', '2026-09-28 16:20:14', NULL),
(104, NULL, 'DC-12673263', NULL, NULL, 0.16, 0, 60.899, 'Gold earned from completed order', 127, '2026-09-29', '2026-09-29 07:37:19', NULL),
(105, NULL, 'DC-82757387', NULL, NULL, 0.04, 0, 60.939, 'Gold earned from completed order', 123, '2026-09-29', '2026-09-29 07:38:33', NULL),
(106, NULL, 'DC-71936170', NULL, NULL, 0.16, 0, 61.099, 'Gold earned from completed order', 85, '2026-09-29', '2026-09-29 07:39:14', NULL),
(107, NULL, 'DC-70620341', NULL, NULL, 0.225, 0, 61.324, 'Gold earned from completed order', 82, '2026-09-29', '2026-09-29 07:39:30', NULL),
(108, NULL, 'DC-12706059', NULL, NULL, 0.02, 0, 61.344, 'Gold earned from completed order', 128, '2026-09-30', '2026-09-30 05:46:33', NULL),
(109, NULL, 'DC-91070305', NULL, NULL, 0.096, 0, 61.44, 'Gold earned from completed order', 131, '2026-09-30', '2026-09-30 05:46:40', NULL),
(110, NULL, 'DC-82778360', NULL, NULL, 0.2, 0, 61.64, 'Gold earned from completed order', 124, '2026-09-30', '2026-09-30 05:46:51', NULL),
(111, NULL, 'DC-04576353', NULL, NULL, 0.13, 0, 61.77, 'Gold earned from completed order', 108, '2026-09-30', '2026-09-30 05:47:14', NULL),
(112, NULL, 'DC-04476355', NULL, NULL, 0.108, 0, 61.878, 'Gold earned from completed order', 104, '2026-09-30', '2026-09-30 05:47:22', NULL),
(113, NULL, 'DC-12596907', NULL, NULL, 0.2, 0, 62.078, 'Gold earned from completed order', 125, '2026-09-30', '2026-09-30 15:14:52', NULL),
(114, NULL, 'DC-92559751', NULL, NULL, 0.126, 0, 62.204, 'Gold earned from completed order', 121, '2026-09-30', '2026-09-30 15:14:59', NULL),
(115, NULL, 'DC-92599055', NULL, NULL, 0.088, 0, 62.292, 'Gold earned from completed order', 122, '2026-09-30', '2026-09-30 15:15:18', NULL),
(116, NULL, 'DC-56296575', NULL, NULL, 0.09, 0, 62.382, 'Gold earned from completed order', 133, '2026-09-30', '2026-09-30 16:32:30', NULL);

INSERT INTO `business_settings` (`id`, `opening_gold_balance`, `company_name`, `created_at`, `rate_22k`, `business_name`, `email`, `phone`, `address`, `default_percentage`, `rate_24k`, `rate_18k`) VALUES
(2, 41.38, NULL, '2026-08-10 07:32:13', 13900, 'DAS & CO', 'connect@dasandco.online', '9390673813', NULL, 2, 14600, 0);


ALTER TABLE `clients` AUTO_INCREMENT = 39;
ALTER TABLE `orders` AUTO_INCREMENT = 135;
ALTER TABLE `expenses` AUTO_INCREMENT = 17;
ALTER TABLE `gold_transactions` AUTO_INCREMENT = 117;
ALTER TABLE `business_settings` AUTO_INCREMENT = 3;

SET FOREIGN_KEY_CHECKS = 1;
