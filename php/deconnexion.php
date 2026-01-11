<?php
/**
 * EcoTrack - Script de déconnexion
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 */

require_once __DIR__ . '/includes/functions.php';

// Démarrer la session
startSecureSession();

// Supprimer le token de mémorisation en base si existant
if (isset($_SESSION['user_id'])) {
    $pdo = getDBConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE utilisateurs SET remember_token = NULL WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
        } catch (PDOException $e) {
            error_log("Erreur lors de la déconnexion : " . $e->getMessage());
        }
    }
}

// Supprimer toutes les variables de session
$_SESSION = [];

// Supprimer le cookie de session
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Détruire la session
session_destroy();

// Supprimer les cookies de mémorisation
deleteCookie(REMEMBER_COOKIE_NAME);
deleteCookie('ecotrack_user_pref');

// Rediriger vers la page d'accueil
header("Location: ../index.html");
exit();
?>
