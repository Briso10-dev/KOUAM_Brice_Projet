<?php
/**
 * EcoTrack - Fonctions utilitaires
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 */

// Inclure la configuration
require_once __DIR__ . '/config.php';

// ===== DÉMARRAGE SÉCURISÉ DE LA SESSION =====
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configuration sécurisée de la session
        ini_set('session.use_only_cookies', 1);
        ini_set('session.use_strict_mode', 1);
        
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
        session_name(SESSION_NAME);
        session_start();
        
        // Régénérer l'ID de session pour prévenir le vol de session
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 1800) {
            // Régénérer après 30 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// ===== VÉRIFIER SI L'UTILISATEUR EST CONNECTÉ =====
function isLoggedIn() {
    startSecureSession();
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// ===== OBTENIR L'UTILISATEUR CONNECTÉ =====
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'nom' => $_SESSION['user_nom'] ?? '',
        'prenom' => $_SESSION['user_prenom'] ?? '',
        'email' => $_SESSION['user_email'] ?? ''
    ];
}

// ===== REDIRECTION =====
function redirect($url) {
    header("Location: $url");
    exit();
}

// ===== NETTOYAGE DES ENTRÉES =====
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// ===== VALIDATION EMAIL =====
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ===== VALIDATION MOT DE PASSE =====
function isValidPassword($password) {
    // Au moins 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
    $pattern = '/^(?=.*[A-Z])(?=.*[0-9])(?=.*[$?!&#@])[A-Za-z0-9$?!&#@]{8,}$/';
    return preg_match($pattern, $password);
}

// ===== VALIDATION NOM/PRÉNOM =====
function isValidName($name) {
    // Au moins 2 caractères, lettres uniquement (avec accents)
    $pattern = '/^[A-Za-zÀ-ÿ\s\-]{2,}$/';
    return preg_match($pattern, $name);
}

// ===== VALIDATION TÉLÉPHONE =====
function isValidPhone($phone) {
    if (empty($phone)) return true; // Champ optionnel
    $pattern = '/^[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/';
    return preg_match($pattern, $phone);
}

// ===== GÉNÉRER UN TOKEN SÉCURISÉ =====
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// ===== DÉFINIR UN COOKIE SÉCURISÉ =====
function setSecureCookie($name, $value, $expiry) {
    setcookie($name, $value, [
        'expires' => $expiry,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}

// ===== SUPPRIMER UN COOKIE =====
function deleteCookie($name) {
    setcookie($name, '', time() - 3600, '/');
}

// ===== MESSAGE FLASH =====
function setFlashMessage($type, $message) {
    startSecureSession();
    $_SESSION['flash'] = [
        'type' => $type,
        'message' => $message
    ];
}

function getFlashMessage() {
    startSecureSession();
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

// ===== AFFICHAGE DES ERREURS EN DÉVELOPPEMENT =====
function displayError($message) {
    // En développement uniquement
    if (true) { // Changer en false pour la production
        echo "<div style='background:#fee;color:#c00;padding:10px;margin:10px;border-radius:5px;'>";
        echo "<strong>Erreur :</strong> " . htmlspecialchars($message);
        echo "</div>";
    }
}
?>
