<?php
/**
 * EcoTrack - Sauvegarde des calculs d'empreinte carbone
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Ce fichier gère la sauvegarde des résultats de calcul en base de données
 */

require_once __DIR__ . '/includes/functions.php';

// Headers pour API JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit();
}

// Récupérer les données JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// Vérifier les données reçues
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Données JSON invalides.'
    ]);
    exit();
}

// Valider les champs requis
$requiredFields = ['transport_co2', 'alimentation_co2', 'logement_co2', 'consommation_co2', 'total_co2'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || !is_numeric($data[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Champ manquant ou invalide : $field"
        ]);
        exit();
    }
}

// Démarrer la session pour récupérer l'utilisateur
startSecureSession();

// Connexion à la base de données
$pdo = getDBConnection();

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données.'
    ]);
    exit();
}

try {
    // Préparer les données
    $transportCO2 = floatval($data['transport_co2']);
    $alimentationCO2 = floatval($data['alimentation_co2']);
    $logementCO2 = floatval($data['logement_co2']);
    $consommationCO2 = floatval($data['consommation_co2']);
    $totalCO2 = floatval($data['total_co2']);
    
    // Détails optionnels (JSON)
    $details = isset($data['details']) ? json_encode($data['details']) : null;
    
    // ID utilisateur (null si non connecté)
    $utilisateurId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    
    // Insérer le calcul
    $stmt = $pdo->prepare("
        INSERT INTO calculs_empreinte 
        (utilisateur_id, transport_co2, alimentation_co2, logement_co2, consommation_co2, total_co2, details_calcul)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $utilisateurId,
        $transportCO2,
        $alimentationCO2,
        $logementCO2,
        $consommationCO2,
        $totalCO2,
        $details
    ]);
    
    $calculId = $pdo->lastInsertId();
    
    // Réponse succès
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Calcul sauvegardé avec succès.',
        'calcul_id' => $calculId,
        'data' => [
            'transport' => $transportCO2,
            'alimentation' => $alimentationCO2,
            'logement' => $logementCO2,
            'consommation' => $consommationCO2,
            'total' => $totalCO2
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Erreur sauvegarde calcul : " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la sauvegarde du calcul.'
    ]);
}
?>
