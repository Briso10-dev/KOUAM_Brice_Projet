<?php
/**
 * EcoTrack - Tableau de bord utilisateur
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Page dynamique affichant le contenu personnalisé selon l'utilisateur connecté
 */

require_once __DIR__ . '/php/includes/functions.php';

// Démarrer la session
startSecureSession();

// Vérifier si l'utilisateur est connecté
if (!isLoggedIn()) {
    setFlashMessage('error', 'Vous devez être connecté pour accéder à cette page.');
    redirect('connexion.html');
}

// Récupérer les informations de l'utilisateur
$user = getCurrentUser();

// Récupérer le message flash si existant
$flash = getFlashMessage();

// Récupérer les préférences utilisateur depuis le cookie
$userPref = [];
if (isset($_COOKIE['ecotrack_user_pref'])) {
    $userPref = json_decode($_COOKIE['ecotrack_user_pref'], true);
}

// Connexion à la base de données pour récupérer les données
$pdo = getDBConnection();
$historique = [];
$stats = [
    'total_calculs' => 0,
    'moyenne_co2' => 0,
    'derniere_empreinte' => null
];
$conseils_appliques = [];

if ($pdo) {
    try {
        // Récupérer l'historique des calculs
        $stmt = $pdo->prepare("
            SELECT * FROM calculs_empreinte 
            WHERE utilisateur_id = ? 
            ORDER BY date_calcul DESC 
            LIMIT 10
        ");
        $stmt->execute([$user['id']]);
        $historique = $stmt->fetchAll();
        
        // Statistiques
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total,
                AVG(total_co2) as moyenne,
                MAX(date_calcul) as dernier
            FROM calculs_empreinte 
            WHERE utilisateur_id = ?
        ");
        $stmt->execute([$user['id']]);
        $result = $stmt->fetch();
        
        $stats['total_calculs'] = $result['total'] ?? 0;
        $stats['moyenne_co2'] = round($result['moyenne'] ?? 0, 2);
        $stats['derniere_empreinte'] = $historique[0]['total_co2'] ?? null;
        
        // Conseils appliqués
        $stmt = $pdo->prepare("
            SELECT c.*, cu.statut, cu.date_application
            FROM conseils_utilisateurs cu
            JOIN conseils c ON cu.conseil_id = c.id
            WHERE cu.utilisateur_id = ?
            ORDER BY cu.date_application DESC
            LIMIT 5
        ");
        $stmt->execute([$user['id']]);
        $conseils_appliques = $stmt->fetchAll();
        
    } catch (PDOException $e) {
        error_log("Erreur dashboard : " . $e->getMessage());
    }
}

// Vérifier l'inactivité de session (comme demandé dans TD_PHP)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    // Déconnexion après 30 minutes d'inactivité
    header("Location: php/deconnexion.php");
    exit();
}
$_SESSION['last_activity'] = time();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tableau de bord - EcoTrack">
    <title>Mon Dashboard - EcoTrack</title>
    
    <!-- Google Fonts - Poppins -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'poppins': ['Poppins', 'sans-serif'],
                    },
                    colors: {
                        'eco-green': '#22c55e',
                        'eco-dark': '#15803d',
                        'eco-light': '#86efac',
                        'eco-bg': '#f0fdf4',
                    }
                }
            }
        }
    </script>
    
    <!-- Chart.js pour les graphiques -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body class="font-poppins bg-gray-50 min-h-screen">
    
    <!-- Header avec utilisateur connecté -->
    <header class="bg-white shadow-md fixed w-full top-0 z-50">
        <nav class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <!-- Logo -->
                <a href="index.html" class="flex items-center space-x-2">
                    <div class="w-10 h-10 bg-eco-green rounded-full flex items-center justify-center">
                        <span class="text-white text-xl">🌱</span>
                    </div>
                    <span class="text-2xl font-bold text-eco-dark">EcoTrack</span>
                </a>
                
                <!-- Menu Desktop -->
                <ul class="hidden md:flex space-x-8">
                    <li><a href="index.html" class="text-gray-600 hover:text-eco-green transition-colors">Accueil</a></li>
                    <li><a href="calculateur.html" class="text-gray-600 hover:text-eco-green transition-colors">Calculateur</a></li>
                    <li><a href="dashboard.php" class="text-eco-dark font-medium hover:text-eco-green transition-colors">Dashboard</a></li>
                    <li><a href="conseils.html" class="text-gray-600 hover:text-eco-green transition-colors">Conseils</a></li>
                </ul>
                
                <!-- Utilisateur connecté -->
                <div class="flex items-center space-x-4">
                    <div class="hidden md:flex items-center space-x-2 bg-eco-bg px-4 py-2 rounded-full">
                        <div class="w-8 h-8 bg-eco-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                            <?= strtoupper(substr($user['prenom'], 0, 1) . substr($user['nom'], 0, 1)) ?>
                        </div>
                        <span class="text-eco-dark font-medium"><?= htmlspecialchars($user['prenom']) ?></span>
                    </div>
                    <a href="php/deconnexion.php" class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                        Déconnexion
                    </a>
                </div>
            </div>
        </nav>
    </header>
    
    <!-- Main Content -->
    <main class="pt-24 pb-12">
        <div class="container mx-auto px-4">
            
            <?php if ($flash): ?>
            <!-- Message flash -->
            <div class="mb-6 p-4 rounded-xl <?= $flash['type'] === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' ?>">
                <?= $flash['message'] ?>
            </div>
            <?php endif; ?>
            
            <!-- En-tête du Dashboard -->
            <div class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Bonjour, <?= htmlspecialchars($user['prenom']) ?> ! 👋
                </h1>
                <p class="text-gray-600">Bienvenue sur votre tableau de bord personnel</p>
            </div>
            
            <!-- Statistiques rapides -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Carte 1: Empreinte actuelle -->
                <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-3xl">🌍</span>
                        <span class="text-sm text-gray-500">Empreinte actuelle</span>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">
                        <?= $stats['derniere_empreinte'] ? number_format($stats['derniere_empreinte'], 1, ',', ' ') : '—' ?>
                    </p>
                    <p class="text-sm text-gray-500">tonnes CO₂/an</p>
                </div>
                
                <!-- Carte 2: Nombre de calculs -->
                <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-3xl">📊</span>
                        <span class="text-sm text-gray-500">Calculs effectués</span>
                    </div>
                    <p class="text-3xl font-bold text-gray-800"><?= $stats['total_calculs'] ?></p>
                    <p class="text-sm text-gray-500">depuis votre inscription</p>
                </div>
                
                <!-- Carte 3: Moyenne -->
                <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-3xl">📈</span>
                        <span class="text-sm text-gray-500">Moyenne</span>
                    </div>
                    <p class="text-3xl font-bold text-gray-800">
                        <?= $stats['moyenne_co2'] ? number_format($stats['moyenne_co2'], 1, ',', ' ') : '—' ?>
                    </p>
                    <p class="text-sm text-gray-500">tonnes CO₂/an</p>
                </div>
                
                <!-- Carte 4: Conseils suivis -->
                <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-3xl">💡</span>
                        <span class="text-sm text-gray-500">Conseils appliqués</span>
                    </div>
                    <p class="text-3xl font-bold text-eco-green"><?= count($conseils_appliques) ?></p>
                    <p class="text-sm text-gray-500">bonnes pratiques</p>
                </div>
            </div>
            
            <!-- Section principale -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Graphique d'évolution -->
                <div class="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">Évolution de votre empreinte</h2>
                    <div class="relative h-64">
                        <canvas id="evolutionChart"></canvas>
                    </div>
                    <?php if (empty($historique)): ?>
                    <div class="text-center py-8 text-gray-500">
                        <p>Aucun calcul effectué pour le moment</p>
                        <a href="calculateur.html" class="inline-block mt-4 px-6 py-3 bg-eco-green text-white rounded-xl hover:bg-eco-dark transition-all">
                            Calculer mon empreinte
                        </a>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- Actions rapides -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">Actions rapides</h2>
                    <div class="space-y-4">
                        <a href="calculateur.html" class="flex items-center p-4 bg-eco-bg rounded-xl hover:bg-eco-light transition-all group">
                            <span class="text-2xl mr-4">📝</span>
                            <div>
                                <p class="font-semibold text-gray-800 group-hover:text-eco-dark">Nouveau calcul</p>
                                <p class="text-sm text-gray-500">Mettre à jour mon empreinte</p>
                            </div>
                        </a>
                        <a href="conseils.html" class="flex items-center p-4 bg-eco-bg rounded-xl hover:bg-eco-light transition-all group">
                            <span class="text-2xl mr-4">💡</span>
                            <div>
                                <p class="font-semibold text-gray-800 group-hover:text-eco-dark">Découvrir des conseils</p>
                                <p class="text-sm text-gray-500">Réduire mon impact</p>
                            </div>
                        </a>
                        <a href="#" class="flex items-center p-4 bg-eco-bg rounded-xl hover:bg-eco-light transition-all group">
                            <span class="text-2xl mr-4">🏆</span>
                            <div>
                                <p class="font-semibold text-gray-800 group-hover:text-eco-dark">Mes objectifs</p>
                                <p class="text-sm text-gray-500">Suivre mes progrès</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            
            <!-- Répartition par catégorie -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <!-- Graphique camembert -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">Répartition par catégorie</h2>
                    <div class="relative h-64">
                        <canvas id="repartitionChart"></canvas>
                    </div>
                </div>
                
                <!-- Derniers conseils -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6">Conseils recommandés</h2>
                    <div class="space-y-4">
                        <div class="flex items-start p-4 bg-green-50 rounded-xl border-l-4 border-eco-green">
                            <span class="text-2xl mr-4">🚲</span>
                            <div>
                                <p class="font-semibold text-gray-800">Privilégier le vélo</p>
                                <p class="text-sm text-gray-600">Pour les trajets de moins de 5km</p>
                                <p class="text-xs text-eco-green mt-1">-500 kg CO₂/an</p>
                            </div>
                        </div>
                        <div class="flex items-start p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                            <span class="text-2xl mr-4">🥗</span>
                            <div>
                                <p class="font-semibold text-gray-800">Réduire la viande rouge</p>
                                <p class="text-sm text-gray-600">1-2 fois par semaine maximum</p>
                                <p class="text-xs text-yellow-600 mt-1">-600 kg CO₂/an</p>
                            </div>
                        </div>
                        <div class="flex items-start p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                            <span class="text-2xl mr-4">🌡️</span>
                            <div>
                                <p class="font-semibold text-gray-800">Baisser le chauffage</p>
                                <p class="text-sm text-gray-600">1°C = 7% d'économie</p>
                                <p class="text-xs text-blue-600 mt-1">-350 kg CO₂/an</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Informations utilisateur -->
            <div class="mt-8 bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6">Mon profil</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-sm text-gray-500 mb-1">Nom complet</p>
                        <p class="font-semibold text-gray-800"><?= htmlspecialchars($user['prenom'] . ' ' . $user['nom']) ?></p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 mb-1">Email</p>
                        <p class="font-semibold text-gray-800"><?= htmlspecialchars($user['email']) ?></p>
                    </div>
                </div>
            </div>
            
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-6">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-400">&copy; 2026 EcoTrack - KOUAM Brice. Tous droits réservés.</p>
        </div>
    </footer>
    
    <!-- JavaScript pour les graphiques -->
    <script>
        // Données pour les graphiques (dynamiques depuis PHP)
        const historiqueData = <?= json_encode(array_reverse($historique)) ?>;
        
        // Graphique d'évolution
        if (historiqueData.length > 0) {
            const ctx1 = document.getElementById('evolutionChart').getContext('2d');
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: historiqueData.map(h => new Date(h.date_calcul).toLocaleDateString('fr-FR')),
                    datasets: [{
                        label: 'Empreinte CO₂ (tonnes/an)',
                        data: historiqueData.map(h => h.total_co2),
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Graphique de répartition
        const lastCalc = historiqueData.length > 0 ? historiqueData[historiqueData.length - 1] : null;
        const ctx2 = document.getElementById('repartitionChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Alimentation', 'Logement', 'Consommation'],
                datasets: [{
                    data: lastCalc ? [
                        lastCalc.transport_co2,
                        lastCalc.alimentation_co2,
                        lastCalc.logement_co2,
                        lastCalc.consommation_co2
                    ] : [30, 25, 25, 20],
                    backgroundColor: [
                        '#22c55e',
                        '#f59e0b',
                        '#3b82f6',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
    
    <script src="js/main.js"></script>
</body>
</html>
