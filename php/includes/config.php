<?php
/**
 * EcoTrack - Configuration de la base de données
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Ce fichier contient les paramètres de connexion à la base de données MySQL
 * À placer dans un dossier sécurisé (php/includes/)
 */

// ===== CONSTANTES DE CONNEXION =====
define('DB_HOST', 'localhost');      // Serveur MySQL
define('DB_NAME', 'ecotrack_db');    // Nom de la base de données
define('DB_USER', 'root');           // Utilisateur MySQL (à modifier en production)
define('DB_PASS', '');               // Mot de passe MySQL (à modifier en production)
define('DB_CHARSET', 'utf8mb4');     // Encodage des caractères

// ===== CONNEXION PDO =====
/**
 * Établit une connexion PDO à la base de données
 * @return PDO|null Instance PDO ou null en cas d'erreur
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $pdo;
        
    } catch (PDOException $e) {
        // En développement, afficher l'erreur
        // En production, logger l'erreur et afficher un message générique
        error_log("Erreur de connexion à la base de données : " . $e->getMessage());
        return null;
    }
}

// ===== CONNEXION MYSQLI (Alternative) =====
/**
 * Établit une connexion mysqli à la base de données
 * @return mysqli|null Instance mysqli ou null en cas d'erreur
 */
function getDBConnectionMysqli() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        error_log("Erreur de connexion mysqli : " . $conn->connect_error);
        return null;
    }
    
    $conn->set_charset(DB_CHARSET);
    
    return $conn;
}

// ===== CONFIGURATION DE SESSION =====
// Durée de vie de la session (en secondes)
define('SESSION_LIFETIME', 3600); // 1 heure

// Nom du cookie de session
define('SESSION_NAME', 'ECOTRACK_SESSION');

// ===== CONFIGURATION DES COOKIES =====
// Durée de vie du cookie "Se souvenir de moi" (en secondes)
define('REMEMBER_COOKIE_LIFETIME', 2592000); // 30 jours

// Nom du cookie de mémorisation
define('REMEMBER_COOKIE_NAME', 'ecotrack_remember');
?>
