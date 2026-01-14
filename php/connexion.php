<?php
/**
 * EcoTrack - Script de connexion
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Gère la connexion des utilisateurs avec :
 * - Vérification des identifiants
 * - Gestion des sessions
 * - Option "Se souvenir de moi" avec cookies
 */

// Inclure les fichiers nécessaires
require_once __DIR__ . '/includes/functions.php';

// Démarrer la session
startSecureSession();

// Si déjà connecté, rediriger vers le dashboard
if (isLoggedIn()) {
    redirect('../dashboard.php');
}

// Vérifier si c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../connexion.html');
}

// ===== RÉCUPÉRATION DES DONNÉES =====
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$remember = isset($_POST['remember']);

// Tableau pour stocker les erreurs
$errors = [];

// Validation de l'email
if (empty($email)) {
    $errors[] = "L'email est requis";
} elseif (!isValidEmail($email)) {
    $errors[] = "L'adresse email n'est pas valide";
}

// Validation du mot de passe
if (empty($password)) {
    $errors[] = "Le mot de passe est requis";
}

// S'il y a des erreurs de validation
if (!empty($errors)) {
    setFlashMessage('error', implode('<br>', $errors));
    redirect('../connexion.html');
}

// ===== CONNEXION À LA BASE DE DONNÉES =====
$pdo = getDBConnection();

if ($pdo === null) {
    setFlashMessage('error', "Erreur de connexion à la base de données. Veuillez réessayer.");
    redirect('../connexion.html');
}

try {
    // ===== RECHERCHE DE L'UTILISATEUR =====
    // Utilisation d'une requête préparée
    $stmt = $pdo->prepare("
        SELECT id, nom, prenom, email, password 
        FROM utilisateurs 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    
    $user = $stmt->fetch();
    
    // ===== VÉRIFICATION DES IDENTIFIANTS =====
    if (!$user) {
        // L'utilisateur n'existe pas
        setFlashMessage('error', "Email ou mot de passe incorrect");
        redirect('../connexion.html');
    }
    
    // Vérifier le mot de passe avec password_verify
    if (!password_verify($password, $user['password'])) {
        // Mot de passe incorrect
        setFlashMessage('error', "Email ou mot de passe incorrect");
        redirect('../connexion.html');
    }
    
    // ===== CONNEXION RÉUSSIE =====
    
    // Créer la session utilisateur
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nom'] = $user['nom'];
    $_SESSION['user_prenom'] = $user['prenom'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['logged_in'] = true;
    $_SESSION['last_activity'] = time();
    
    // ===== GESTION DU "SE SOUVENIR DE MOI" =====
    if ($remember) {
        // Générer un token unique
        $remember_token = generateToken();
        
        // Stocker le token en base de données
        $stmt = $pdo->prepare("
            UPDATE utilisateurs 
            SET remember_token = ? 
            WHERE id = ?
        ");
        $stmt->execute([$remember_token, $user['id']]);
        
        // Créer le cookie de mémorisation
        setSecureCookie(REMEMBER_COOKIE_NAME, $remember_token, time() + REMEMBER_COOKIE_LIFETIME);
    }
    
    // ===== MISE À JOUR DES COOKIES DE PRÉFÉRENCE =====
    setSecureCookie('ecotrack_user_pref', json_encode([
        'theme' => 'light',
        'nom' => $user['nom'],
        'prenom' => $user['prenom'],
        'last_login' => date('Y-m-d H:i:s')
    ]), time() + REMEMBER_COOKIE_LIFETIME);
    
    // Mettre à jour la date de dernière connexion
    $stmt = $pdo->prepare("
        UPDATE utilisateurs 
        SET derniere_connexion = NOW() 
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    
    // Message de bienvenue
    setFlashMessage('success', "Bon retour, " . $user['prenom'] . " !");
    
    // Rediriger vers le tableau de bord
    redirect('../dashboard.php');
    
} catch (PDOException $e) {
    error_log("Erreur lors de la connexion : " . $e->getMessage());
    setFlashMessage('error', "Une erreur est survenue. Veuillez réessayer.");
    redirect('../connexion.html');
}
?>
