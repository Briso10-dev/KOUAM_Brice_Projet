/**
 * EcoTrack - Validation des formulaires
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Ce fichier gère la validation côté client des formulaires
 * conformément aux exigences du TD_JS (expressions régulières, tooltips, etc.)
 */

// ===== EXPRESSIONS RÉGULIÈRES =====
const REGEX = {
    // Nom et Prénom : lettres uniquement (avec accents), min 2 caractères
    nom: /^[A-Za-zÀ-ÿ\s\-]{2,}$/,
    
    // Email : format standard
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // Téléphone : format 00.00.00.00.00
    telephone: /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/,
    
    // Mot de passe : 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
    password: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[$?!&#@])[A-Za-z0-9$?!&#@]{8,}$/,
    
    // Au moins une majuscule
    hasUppercase: /[A-Z]/,
    
    // Au moins un chiffre
    hasNumber: /[0-9]/,
    
    // Au moins un caractère spécial
    hasSpecial: /[$?!&#@]/
};

// ===== CLASSE DE VALIDATION =====
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.isValid = true;
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        // Validation en temps réel sur les inputs
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
        
        // Validation à la soumission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Toggle password visibility
        this.initPasswordToggle();
        
        // Password strength indicator
        this.initPasswordStrength();
    }
    
    // ===== VALIDATION D'UN CHAMP =====
    validateField(input) {
        const fieldName = input.id;
        const value = input.value.trim();
        let isFieldValid = true;
        let errorMessage = '';
        
        switch(fieldName) {
            case 'nom':
            case 'prenom':
                if (value.length < 2) {
                    isFieldValid = false;
                    errorMessage = `Le ${fieldName} doit contenir au moins 2 caractères`;
                } else if (!REGEX.nom.test(value)) {
                    isFieldValid = false;
                    errorMessage = `Le ${fieldName} ne doit contenir que des lettres`;
                }
                break;
                
            case 'email':
                if (!REGEX.email.test(value)) {
                    isFieldValid = false;
                    errorMessage = 'Veuillez entrer une adresse email valide';
                }
                break;
                
            case 'telephone':
                if (value && !REGEX.telephone.test(value)) {
                    isFieldValid = false;
                    errorMessage = 'Format attendu : 00.00.00.00.00';
                }
                break;
                
            case 'password':
                if (value.length < 8) {
                    isFieldValid = false;
                    errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
                } else if (!REGEX.password.test(value)) {
                    isFieldValid = false;
                    errorMessage = 'Le mot de passe doit contenir 1 majuscule, 1 chiffre et 1 caractère spécial ($?!&#@)';
                }
                break;
                
            case 'password-confirm':
                const password = document.getElementById('password');
                if (password && value !== password.value) {
                    isFieldValid = false;
                    errorMessage = 'Les mots de passe ne correspondent pas';
                }
                break;
        }
        
        if (!isFieldValid) {
            this.showError(input, errorMessage);
        } else {
            this.showSuccess(input);
        }
        
        return isFieldValid;
    }
    
    // ===== AFFICHER ERREUR =====
    showError(input, message) {
        input.classList.remove('border-eco-green', 'border-gray-200');
        input.classList.add('border-red-500');
        
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        
        // Animation shake
        input.classList.add('animate-shake');
        setTimeout(() => input.classList.remove('animate-shake'), 500);
    }
    
    // ===== AFFICHER SUCCÈS =====
    showSuccess(input) {
        input.classList.remove('border-red-500', 'border-gray-200');
        input.classList.add('border-eco-green');
        
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }
    
    // ===== EFFACER ERREUR =====
    clearError(input) {
        input.classList.remove('border-red-500');
        input.classList.add('border-gray-200');
        
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }
    
    // ===== TOGGLE PASSWORD =====
    initPasswordToggle() {
        const toggleBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
            });
        }
    }
    
    // ===== INDICATEUR FORCE MOT DE PASSE =====
    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthBar = document.getElementById('password-strength');
        const strengthText = document.getElementById('password-strength-text');
        
        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = `${strength.score}%`;
                strengthBar.className = `h-full transition-all duration-300 ${strength.color}`;
                
                if (strengthText) {
                    strengthText.textContent = strength.text;
                    strengthText.className = `text-xs mt-1 ${strength.textColor}`;
                }
            });
        }
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        let text = '';
        let color = 'bg-red-500';
        let textColor = 'text-red-500';
        
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 15;
        if (REGEX.hasUppercase.test(password)) score += 20;
        if (REGEX.hasNumber.test(password)) score += 20;
        if (REGEX.hasSpecial.test(password)) score += 20;
        
        if (score <= 25) {
            text = 'Très faible';
            color = 'bg-red-500';
            textColor = 'text-red-500';
        } else if (score <= 50) {
            text = 'Faible';
            color = 'bg-orange-500';
            textColor = 'text-orange-500';
        } else if (score <= 75) {
            text = 'Moyen';
            color = 'bg-yellow-500';
            textColor = 'text-yellow-500';
        } else {
            text = 'Fort';
            color = 'bg-eco-green';
            textColor = 'text-eco-green';
        }
        
        return { score, text, color, textColor };
    }
    
    // ===== SOUMISSION DU FORMULAIRE =====
    handleSubmit(e) {
        e.preventDefault();
        this.isValid = true;
        
        // Valider tous les champs requis
        this.form.querySelectorAll('input[required]').forEach(input => {
            if (!this.validateField(input)) {
                this.isValid = false;
            }
        });
        
        // Vérifier la checkbox conditions
        const conditions = document.getElementById('conditions');
        if (conditions && !conditions.checked) {
            this.isValid = false;
            const conditionsError = document.getElementById('conditions-error');
            if (conditionsError) {
                conditionsError.classList.remove('hidden');
            }
        }
        
        if (this.isValid) {
            // Mettre nom, prénom en majuscules avant envoi (comme demandé dans TD_JS)
            const nomInput = document.getElementById('nom');
            const prenomInput = document.getElementById('prenom');
            
            if (nomInput) nomInput.value = nomInput.value.toUpperCase();
            if (prenomInput) prenomInput.value = prenomInput.value.toUpperCase();
            
            // Soumettre le formulaire
            this.form.submit();
        } else {
            // Scroll vers la première erreur
            const firstError = this.form.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    }
}

// ===== ANIMATION SHAKE CSS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .animate-shake {
        animation: shake 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la validation pour le formulaire d'inscription
    new FormValidator('inscription-form');
    
    // Initialiser la validation pour le formulaire de connexion
    new FormValidator('connexion-form');
    
    console.log('✅ Module de validation chargé');
});

// ===== BIBLIOTHÈQUE DE FONCTIONS (comme demandé dans TD_JS) =====

/**
 * Vérifie si un élément est présent dans un tableau
 * @param {Array} tableau - Le tableau à parcourir
 * @param {*} element - L'élément à rechercher
 * @returns {boolean}
 */
function rechercherElement(tableau, element) {
    return tableau.includes(element);
}

/**
 * Calcule la moyenne d'un tableau de nombres
 * @param {Array} tableau - Tableau de nombres
 * @returns {number}
 */
function calculerMoyenne(tableau) {
    if (tableau.length === 0) return 0;
    const somme = tableau.reduce((acc, val) => acc + val, 0);
    return somme / tableau.length;
}

/**
 * Trouve la valeur maximale d'un tableau
 * @param {Array} tableau - Tableau de nombres
 * @returns {number}
 */
function trouverMax(tableau) {
    return Math.max(...tableau);
}

/**
 * Compte les éléments supérieurs ou égaux à une valeur
 * @param {Array} tableau - Tableau de nombres
 * @param {number} seuil - Valeur seuil
 * @returns {number}
 */
function compterSuperieurOuEgal(tableau, seuil) {
    return tableau.filter(val => val >= seuil).length;
}

/**
 * Affiche un tableau dans la console
 * @param {Array} tableau - Tableau à afficher
 */
function afficherTableau(tableau) {
    console.table(tableau);
}
