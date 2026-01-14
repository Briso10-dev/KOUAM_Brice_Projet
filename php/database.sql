-- =====================================================
-- EcoTrack - Script de création de la base de données
-- Auteur: KOUAM Brice
-- Projet: Technologie de l'Internet - ENSIM
-- =====================================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS ecotrack_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ecotrack_db;

-- =====================================================
-- TABLE: utilisateurs
-- Stocke les informations des utilisateurs inscrits
-- =====================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(255) DEFAULT NULL,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME DEFAULT NULL,
    actif TINYINT(1) DEFAULT 1,
    
    INDEX idx_email (email),
    INDEX idx_remember_token (remember_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: calculs_empreinte
-- Stocke l'historique des calculs d'empreinte carbone
-- =====================================================
CREATE TABLE IF NOT EXISTS calculs_empreinte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    transport_co2 DECIMAL(10,2) DEFAULT 0,
    alimentation_co2 DECIMAL(10,2) DEFAULT 0,
    logement_co2 DECIMAL(10,2) DEFAULT 0,
    consommation_co2 DECIMAL(10,2) DEFAULT 0,
    total_co2 DECIMAL(10,2) DEFAULT 0,
    date_calcul DATETIME DEFAULT CURRENT_TIMESTAMP,
    details JSON DEFAULT NULL,
    
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_date (date_calcul)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: conseils
-- Stocke les conseils écologiques
-- =====================================================
CREATE TABLE IF NOT EXISTS conseils (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie ENUM('transport', 'alimentation', 'logement', 'consommation') NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact_co2 DECIMAL(10,2) DEFAULT 0 COMMENT 'Économie potentielle en kg CO2/an',
    difficulte ENUM('facile', 'moyen', 'difficile') DEFAULT 'moyen',
    actif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: conseils_utilisateurs
-- Relation entre utilisateurs et conseils appliqués
-- =====================================================
CREATE TABLE IF NOT EXISTS conseils_utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    conseil_id INT NOT NULL,
    date_application DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_cours', 'applique', 'abandonne') DEFAULT 'en_cours',
    
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (conseil_id) REFERENCES conseils(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_conseil (utilisateur_id, conseil_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTION DES CONSEILS PAR DÉFAUT
-- =====================================================
INSERT INTO conseils (categorie, titre, description, impact_co2, difficulte) VALUES
-- Transport
('transport', 'Privilégier le vélo pour les trajets courts', 'Utilisez le vélo pour les trajets de moins de 5 km. C''est bon pour la santé et pour la planète !', 500, 'facile'),
('transport', 'Covoiturage domicile-travail', 'Partagez vos trajets quotidiens avec des collègues ou voisins.', 800, 'moyen'),
('transport', 'Utiliser les transports en commun', 'Préférez le bus, métro ou train à la voiture individuelle.', 1200, 'facile'),
('transport', 'Réduire les voyages en avion', 'Privilégiez le train pour les trajets de moins de 1000 km.', 2000, 'difficile'),

-- Alimentation
('alimentation', 'Réduire la consommation de viande', 'Limitez la viande rouge à 1-2 fois par semaine.', 600, 'moyen'),
('alimentation', 'Acheter local et de saison', 'Privilégiez les producteurs locaux et les fruits/légumes de saison.', 400, 'facile'),
('alimentation', 'Éviter le gaspillage alimentaire', 'Planifiez vos repas et conservez correctement les aliments.', 300, 'facile'),
('alimentation', 'Réduire les produits transformés', 'Cuisinez davantage à partir de produits bruts.', 250, 'moyen'),

-- Logement
('logement', 'Baisser le chauffage de 1°C', 'Chaque degré en moins représente 7% d''économie d''énergie.', 350, 'facile'),
('logement', 'Éteindre les appareils en veille', 'Utilisez des multiprises avec interrupteur.', 150, 'facile'),
('logement', 'Améliorer l''isolation', 'Isolez combles, fenêtres et portes pour réduire les pertes de chaleur.', 800, 'difficile'),
('logement', 'Passer aux LED', 'Remplacez toutes vos ampoules par des LED basse consommation.', 100, 'facile'),

-- Consommation
('consommation', 'Acheter d''occasion', 'Privilégiez les vêtements, meubles et appareils de seconde main.', 400, 'facile'),
('consommation', 'Réparer plutôt que jeter', 'Faites réparer vos appareils électroniques et électroménagers.', 300, 'moyen'),
('consommation', 'Réduire le numérique', 'Limitez le streaming, supprimez les emails inutiles, prolongez la vie de vos appareils.', 200, 'facile'),
('consommation', 'Éviter le suremballage', 'Achetez en vrac et refusez les sacs plastiques.', 150, 'facile');

-- =====================================================
-- UTILISATEUR DE TEST (mot de passe: Test@123)
-- =====================================================
INSERT INTO utilisateurs (nom, prenom, email, telephone, password) VALUES
('DUPONT', 'Jean', 'jean.dupont@test.com', '06.12.34.56.78', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4pjyxqOeT.ZqYXHe');
