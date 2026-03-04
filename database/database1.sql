-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: meeting_room_booking
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('confirmed','cancelled','pending','vacated') DEFAULT 'confirmed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  KEY `idx_booking_room_time` (`room_id`,`start_time`,`end_time`),
  KEY `idx_booking_employee` (`employee_id`),
  CONSTRAINT `fk_booking_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`room_id`) REFERENCES `meeting_room` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_booking_end_after_start` CHECK ((`end_time` > `start_time`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_audit`
--

DROP TABLE IF EXISTS `booking_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_audit` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `action` enum('created','updated','cancelled','vacated') NOT NULL,
  `actor_employee_id` int NOT NULL,
  `previous_status` enum('confirmed','cancelled','pending','vacated') DEFAULT NULL,
  `new_status` enum('confirmed','cancelled','pending','vacated') DEFAULT NULL,
  `previous_start_time` datetime DEFAULT NULL,
  `previous_end_time` datetime DEFAULT NULL,
  `new_start_time` datetime DEFAULT NULL,
  `new_end_time` datetime DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_booking_audit_booking` (`booking_id`,`created_at`),
  KEY `idx_booking_audit_actor` (`actor_employee_id`,`created_at`),
  CONSTRAINT `fk_booking_audit_actor` FOREIGN KEY (`actor_employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_audit_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_audit`
--

LOCK TABLES `booking_audit` WRITE;
/*!40000 ALTER TABLE `booking_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `gender` enum('male','female') NOT NULL DEFAULT 'male',
  `is_admin` tinyint(1) DEFAULT '0',
  `password` varchar(255) NOT NULL,
  `password_reset_required` tinyint(1) NOT NULL DEFAULT '1',
  `password_updated_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` (`employee_id`,`name`,`email`,`department`,`gender`,`is_admin`,`password`,`password_reset_required`,`password_updated_at`,`last_login_at`) VALUES
  (1,'Alice Johnson','alice.johnson@company.com','Engineering','female',1,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (2,'Bob Smith','bob.smith@company.com','Marketing','male',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (3,'Carol White','carol.white@company.com','Sales','female',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (4,'David Brown','david.brown@company.com','Human Resources','male',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (5,'Eve Davis','eve.davis@company.com','Finance','female',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (6,'Frank Miller','frank.miller@company.com','Engineering','male',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (7,'Grace Wilson','grace.wilson@company.com','Sales','female',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (8,'Henry Taylor','henry.taylor@company.com','IT Support','male',1,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (9,'Irene Moore','irene.moore@company.com','Marketing','female',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL),
  (10,'Jack Anderson','jack.anderson@company.com','Operations','male',0,'REDACTED_HASH_REQUIRED',1,NULL,NULL);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` text,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,'South Africa (Head Office)','Unit N101B, Ground Floor\nNorth Block, Bradenham Hall\n7 Mellis Avenue\nRivonia, Sandton – 2128\nSouth Africa','Africa/Johannesburg'),(2,'India Headquarters','Exaze Private Limited\n34 Sunder Nagar\nBhilai\nChhattisgarh – 490023\nIndia','Asia/Kolkata'),(3,'United Kingdom (Sales Office)','Unit 11, Diddenham Court\nGrazeley\nReading\nBerkshire – RG7 1JQ\nEngland','Europe/London'),(4,'Delivery Centre - Hyderabad','5th Floor, Rajapushpa Summit\nNanakramguda Road\nFinancial District\nHyderabad, Telangana – 500008\nIndia','Asia/Kolkata'),(5,'Delivery Centre - Pune','S-38 A, Second Floor,\nQue Spaces, Seasons Mall\nMagarpatta, Hadapsar\nPune, Maharashtra – 411013\nIndia','Asia/Kolkata'),(6,'Delivery Centre - Bhopal','92 B, Sector A\nIndustrial Area\nGovindpura\nBhopal, Madhya Pradesh – 462023\nIndia','Asia/Kolkata');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting_room`
--

DROP TABLE IF EXISTS `meeting_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_room` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `location_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int NOT NULL,
  `size_sqft` decimal(8,2) DEFAULT NULL,
  `has_projector` tinyint(1) DEFAULT '0',
  `has_screen` tinyint(1) DEFAULT '0',
  `has_whiteboard` tinyint(1) DEFAULT '0',
  `description` text,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `unique_room_per_location` (`location_id`,`name`),
  CONSTRAINT `fk_meeting_room_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE,
  CONSTRAINT `meeting_room_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_room`
--

LOCK TABLES `meeting_room` WRITE;
/*!40000 ALTER TABLE `meeting_room` DISABLE KEYS */;
INSERT INTO `meeting_room` VALUES (1,1,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(2,1,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(3,1,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(4,1,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(5,1,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(6,1,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(7,1,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(8,1,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(9,1,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(10,1,'Training Room',25,500.00,1,1,1,'Equipped for training sessions'),(11,2,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(12,2,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(13,2,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(14,2,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(15,2,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(16,2,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(17,2,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(18,2,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(19,2,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(20,2,'Training Room',25,500.00,1,1,1,'Equipped for training sessions'),(21,3,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(22,3,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(23,3,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(24,3,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(25,3,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(26,3,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(27,3,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(28,3,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(29,3,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(30,3,'Training Room',25,500.00,1,1,1,'Equipped for training sessions'),(31,4,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(32,4,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(33,4,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(34,4,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(35,4,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(36,4,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(37,4,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(38,4,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(39,4,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(40,4,'Training Room',25,500.00,1,1,1,'Equipped for training sessions'),(41,5,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(42,5,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(43,5,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(44,5,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(45,5,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(46,5,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(47,5,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(48,5,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(49,5,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(50,5,'Training Room',25,500.00,1,1,1,'Equipped for training sessions'),(51,6,'Think Tank',10,200.00,1,1,0,'Ideal for brainstorming sessions'),(52,6,'Fusion',12,250.00,1,1,1,'Collaborative space with all amenities'),(53,6,'Nexus',8,180.00,0,1,1,'Small meeting room with whiteboard'),(54,6,'Cell Pod 1',4,100.00,0,0,1,'Private phone booth style'),(55,6,'Cell Pod 2',4,100.00,0,0,1,'Private focus pod'),(56,6,'Innovation Hub',20,400.00,1,1,1,'Large room for presentations'),(57,6,'Boardroom',14,300.00,1,1,0,'Formal board meetings'),(58,6,'Conference Room A',16,350.00,1,1,1,'Standard conference room'),(59,6,'Conference Room B',16,350.00,1,1,0,'Second conference room'),(60,6,'Training Room',25,500.00,1,1,1,'Equipped for training sessions');
/*!40000 ALTER TABLE `meeting_room` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 18:30:10
