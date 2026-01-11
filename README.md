# 🌱 EcoTrack - Calculateur d'Empreinte Carbone

> **Projet Technologie de l'Internet - ENSIM**  
> Auteur : KOUAM Brice  
> Année : 2024-2025

---

## 📋 Description

**EcoTrack** est une application web permettant de calculer son empreinte carbone personnelle et de recevoir des conseils personnalisés pour la réduire. Ce projet a été réalisé dans le cadre du cours de Technologie de l'Internet à l'École Nationale Supérieure d'Ingénieurs du Mans (ENSIM).

### Fonctionnalités principales

- ✅ **Calculateur interactif** : Calcul d'empreinte carbone en 4 étapes (Transport, Logement, Alimentation, Consommation)
- ✅ **Authentification sécurisée** : Inscription et connexion avec hachage des mots de passe
- ✅ **Dashboard personnalisé** : Suivi de l'évolution de l'empreinte avec graphiques
- ✅ **Conseils écologiques** : Recommandations personnalisées pour réduire son impact
- ✅ **Design responsive** : Interface adaptée à tous les appareils

---

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** sémantique (header, main, section, footer, article)
- **CSS3** avec reset personnalisé et animations
- **TailwindCSS** via CDN pour le design
- **JavaScript ES6+** pour l'interactivité
- **Chart.js** pour les graphiques

### Backend
- **PHP 8** avec programmation orientée objet
- **PDO** avec requêtes préparées (protection SQL injection)
- **Sessions** et **Cookies** sécurisés

### Base de données
- **MySQL** / **MariaDB**

### Outils
- **Git** pour le versionnement
- **Google Fonts** (Poppins)

---

## 📁 Structure du Projet

```
KOUAM_Brice_Projet/
├── index.html              # Page d'accueil
├── calculateur.html        # Calculateur d'empreinte carbone
├── conseils.html           # Page des conseils écologiques
├── a-propos.html           # Page à propos
├── inscription.html        # Formulaire d'inscription
├── connexion.html          # Formulaire de connexion
├── dashboard.php           # Tableau de bord utilisateur (dynamique)
├── css/
│   └── styles.css          # Styles CSS personnalisés
├── js/
│   ├── main.js             # JavaScript principal
│   ├── calculateur.js      # Logique du calculateur
│   └── validation.js       # Validation des formulaires
├── php/
│   ├── includes/
│   │   ├── config.php      # Configuration base de données
│   │   └── functions.php   # Fonctions utilitaires
│   ├── inscription.php     # Traitement inscription
│   ├── connexion.php       # Traitement connexion
│   ├── deconnexion.php     # Déconnexion
│   └── database.sql        # Script création BDD
├── images/                 # Dossier images (vide)
├── assets/                 # Autres ressources
└── README.md               # Ce fichier
```

---

## 🚀 Installation

### Prérequis
- Serveur web (Apache/Nginx)
- PHP 8.0 ou supérieur
- MySQL 5.7 ou supérieur / MariaDB 10.3+
- Navigateur moderne

### Étapes d'installation

1. **Cloner ou copier le projet** dans le dossier web (htdocs, www, etc.)

2. **Créer la base de données**
   ```sql
   CREATE DATABASE ecotrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Importer le schéma**
   ```bash
   mysql -u votre_user -p ecotrack_db < php/database.sql
   ```

4. **Configurer la connexion** dans `php/includes/config.php`
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'ecotrack_db');
   define('DB_USER', 'votre_utilisateur');
   define('DB_PASS', 'votre_mot_de_passe');
   ```

5. **Accéder à l'application** via `http://localhost/KOUAM_Brice_Projet/`

---

## 🔐 Sécurité Implémentée

- **Hachage des mots de passe** avec `password_hash()` (BCRYPT, cost 12)
- **Requêtes préparées** (protection SQL injection)
- **Validation côté client ET serveur**
- **Protection XSS** avec `htmlspecialchars()`
- **Sessions sécurisées** (régénération ID, timeout)
- **Cookies sécurisés** (HttpOnly, SameSite)

---

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints à :
- **1024px** : Tablettes paysage
- **768px** : Tablettes portrait
- **480px** : Smartphones

---

## 🎨 Charte Graphique

- **Police** : Poppins (Google Fonts)
- **Couleur principale** : `#22c55e` (eco-green)
- **Couleur secondaire** : `#15803d` (eco-dark)
- **Fond clair** : `#f0fdf4` (eco-bg)

---

## 📝 Validation des Formulaires

### Règles de validation (JavaScript)
- **Nom/Prénom** : Lettres uniquement, 2-50 caractères
- **Email** : Format valide (regex)
- **Téléphone** : Format français (00.00.00.00.00)
- **Mot de passe** : 
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial

---

## 📊 Facteurs d'Émission

Les calculs sont basés sur les données de l'**ADEME** et du **GIEC** :

| Catégorie | Facteur | Unité |
|-----------|---------|-------|
| Voiture essence | 0.21 | kg CO₂/km |
| Voiture diesel | 0.19 | kg CO₂/km |
| Voiture électrique | 0.05 | kg CO₂/km |
| Vol avion | 285 | kg CO₂/vol |
| Chauffage gaz | 35 | kg CO₂/m²/an |

---

## 👨‍💻 Auteur

**KOUAM Brice**  
Étudiant en Ingénierie - ENSIM, Le Mans  
📧 brice.kouam@ensim.fr

---

## 📄 Licence

Ce projet est réalisé dans un cadre académique.  
© 2026 EcoTrack - Tous droits réservés.

---

## 🙏 Remerciements

- **ENSIM** pour le cadre pédagogique
- **ADEME** pour les données environnementales
- **TailwindCSS** et **Chart.js** pour les outils open source
