<?php
/**
 * EcoTrack - Script d'inscription
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Gère l'inscription des nouveaux utilisateurs avec :
 * - Validation des données
 * - Hash sécurisé du mot de passe
 * - Requêtes préparées pour éviter les injections SQL
 */

// Inclure les fichiers nécessaires
require_once __DIR__ . '/includes/functions.php';

// Démarrer la session
startSecureSession();

// Vérifier si c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../inscription.html');
}

// ===== RÉCUPÉRATION ET VALIDATION DES DONNÉES =====

// Récupérer les données du formulaire
$nom = isset($_POST['nom']) ? sanitizeInput($_POST['nom']) : '';
$prenom = isset($_POST['prenom']) ? sanitizeInput($_POST['prenom']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$telephone = isset($_POST['telephone']) ? sanitizeInput($_POST['telephone']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$password_confirm = isset($_POST['password_confirm']) ? $_POST['password_confirm'] : '';
$conditions = isset($_POST['conditions']);

// Tableau pour stocker les erreurs
$errors = [];

// Validation du nom
if (empty($nom)) {
    $errors[] = "Le nom est requis";
} elseif (!isValidName($nom)) {
    $errors[] = "Le nom doit contenir au moins 2 caractères (lettres uniquement)";
}

// Validation du prénom
if (empty($prenom)) {
    $errors[] = "Le prénom est requis";
} elseif (!isValidName($prenom)) {
    $errors[] = "Le prénom doit contenir au moins 2 caractères (lettres uniquement)";
}

// Validation de l'email
if (empty($email)) {
    $errors[] = "L'email est requis";
} elseif (!isValidEmail($email)) {
    $errors[] = "L'adresse email n'est pas valide";
}

// Validation du téléphone (optionnel)
if (!empty($telephone) && !isValidPhone($telephone)) {
    $errors[] = "Le format du téléphone doit être 00.00.00.00.00";
}

// Validation du mot de passe
if (empty($password)) {
    $errors[] = "Le mot de passe est requis";
} elseif (!isValidPassword($password)) {
    $errors[] = "Le mot de passe doit contenir 8 caractères min., 1 majuscule, 1 chiffre et 1 caractère spécial";
}

// Vérification de la confirmation du mot de passe
if ($password !== $password_confirm) {
    $errors[] = "Les mots de passe ne correspondent pas";
}

// Vérification des conditions
if (!$conditions) {
    $errors[] = "Vous devez accepter les conditions d'utilisation";
}

// ===== S'IL Y A DES ERREURS =====
if (!empty($errors)) {
    setFlashMessage('error', implode('<br>', $errors));
    redirect('../inscription.html');
}

// ===== CONNEXION À LA BASE DE DONNÉES =====
$pdo = getDBConnection();

if ($pdo === null) {
    setFlashMessage('error', "Erreur de connexion à la base de données. Veuillez réessayer.");
    redirect('../inscription.html');
}

try {
    // ===== VÉRIFIER SI L'EMAIL EXISTE DÉJÀ =====
    $stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        setFlashMessage('error', "Cette adresse email est déjà utilisée");
        redirect('../inscription.html');
    }
    
    // ===== HASH DU MOT DE PASSE =====
    // Utilisation de password_hash avec l'algorithme BCRYPT (recommandé)
    $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // ===== INSERTION DU NOUVEL UTILISATEUR =====
    // Utilisation d'une requête préparée pour éviter les injections SQL
    $stmt = $pdo->prepare("
        INSERT INTO utilisateurs (nom, prenom, email, telephone, password, date_inscription) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    
    // Mettre le nom et prénom en majuscules (comme demandé dans TD_JS)
    $nom = strtoupper($nom);
    $prenom = strtoupper($prenom);
    
    $stmt->execute([$nom, $prenom, $email, $telephone, $password_hash]);
    
    // Récupérer l'ID du nouvel utilisateur
    $user_id = $pdo->lastInsertId();
    
    // ===== CRÉER LA SESSION UTILISATEUR =====
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_nom'] = $nom;
    $_SESSION['user_prenom'] = $prenom;
    $_SESSION['user_email'] = $email;
    $_SESSION['logged_in'] = true;
    
    // ===== CRÉER UN COOKIE DE PRÉFÉRENCE =====
    // Cookie pour stocker des préférences utilisateur (comme demandé dans TD_PHP)
    setSecureCookie('ecotrack_user_pref', json_encode([
        'theme' => 'light',
        'nom' => $nom,
        'prenom' => $prenom
    ]), time() + REMEMBER_COOKIE_LIFETIME);
    
    // Message de succès
    setFlashMessage('success', "Bienvenue sur EcoTrack, $prenom ! Votre compte a été créé avec succès.");
    
    // Rediriger vers le tableau de bord
    redirect('../dashboard.php');
    
} catch (PDOException $e) {
    error_log("Erreur lors de l'inscription : " . $e->getMessage());
    setFlashMessage('error', "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    redirect('../inscription.html');
}
?>
