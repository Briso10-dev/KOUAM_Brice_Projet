/**
 * EcoTrack - Calculateur d'Empreinte Carbone
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 * 
 * Ce fichier gère toute la logique du calculateur interactif
 * avec des animations fluides et des calculs précis
 */

'use strict';

// ============================================
// Configuration et constantes
// ============================================

// Facteurs d'émission en kg CO2 par an (sources: ADEME, GIEC)
const EMISSION_FACTORS = {
    transport: {
        car: {
            essence: 0.21,    // kg CO2 par km
            diesel: 0.19,
            electrique: 0.05,
            none: 0
        },
        flight: 285           // kg CO2 par vol moyen (aller-retour)
    },
    housing: {
        heating: {
            electrique: 15,   // kg CO2 par m² par an
            gaz: 35,
            fioul: 45,
            pompe: 8
        },
        base: 200             // kg CO2 base par personne (électricité, eau...)
    },
    food: {
        diet: {
            vegan: 1000,      // kg CO2 par an
            vegetarian: 1500,
            omnivore: 2500
        },
        meat: 150,            // kg CO2 par repas avec viande supplémentaire
        localBonus: -200      // Réduction si achats locaux
    },
    consumption: {
        clothes: 25,          // kg CO2 par vêtement neuf
        electronics: 200,     // kg CO2 par appareil électronique
        recyclingBonus: -100  // Réduction si recyclage
    }
};

// Niveaux d'empreinte
const LEVELS = {
    excellent: { max: 4, color: '#22c55e', label: 'Excellent', emoji: '🌟' },
    good: { max: 6, color: '#84cc16', label: 'Bien', emoji: '👍' },
    average: { max: 9, color: '#eab308', label: 'Moyen', emoji: '📊' },
    high: { max: 12, color: '#f97316', label: 'Élevé', emoji: '⚠️' },
    veryHigh: { max: Infinity, color: '#ef4444', label: 'Très élevé', emoji: '🚨' }
};

// État de l'application
let currentStep = 1;
const totalSteps = 4;

// ============================================
// Gestion des étapes du formulaire
// ============================================

/**
 * Passe à l'étape suivante avec animation
 * @param {number} current - Numéro de l'étape actuelle
 */
function nextStep(current) {
    if (current >= totalSteps) return;
    
    const currentSection = document.getElementById(`step${current}`);
    const nextSection = document.getElementById(`step${current + 1}`);
    
    // Animation de sortie
    currentSection.style.opacity = '0';
    currentSection.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
        currentSection.classList.add('hidden');
        nextSection.classList.remove('hidden');
        
        // Animation d'entrée
        nextSection.style.opacity = '0';
        nextSection.style.transform = 'translateX(30px)';
        
        requestAnimationFrame(() => {
            nextSection.style.transition = 'all 0.4s ease';
            nextSection.style.opacity = '1';
            nextSection.style.transform = 'translateX(0)';
        });
        
        currentStep = current + 1;
        updateProgressIndicator();
    }, 300);
}

/**
 * Retourne à l'étape précédente
 * @param {number} current - Numéro de l'étape actuelle
 */
function prevStep(current) {
    if (current <= 1) return;
    
    const currentSection = document.getElementById(`step${current}`);
    const prevSection = document.getElementById(`step${current - 1}`);
    
    currentSection.style.opacity = '0';
    currentSection.style.transform = 'translateX(30px)';
    
    setTimeout(() => {
        currentSection.classList.add('hidden');
        prevSection.classList.remove('hidden');
        
        prevSection.style.opacity = '0';
        prevSection.style.transform = 'translateX(-30px)';
        
        requestAnimationFrame(() => {
            prevSection.style.transition = 'all 0.4s ease';
            prevSection.style.opacity = '1';
            prevSection.style.transform = 'translateX(0)';
        });
        
        currentStep = current - 1;
        updateProgressIndicator();
    }, 300);
}

/**
 * Met à jour l'indicateur de progression
 */
function updateProgressIndicator() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    // Animation de la barre
    progressBar.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;
    
    // Mise à jour des indicateurs d'étape
    for (let i = 1; i <= totalSteps; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        indicator.classList.remove('active', 'completed');
        
        if (i < currentStep) {
            indicator.classList.add('completed');
        } else if (i === currentStep) {
            indicator.classList.add('active');
        }
    }
}

// ============================================
// Gestion des inputs interactifs
// ============================================

/**
 * Initialise les sliders (range inputs)
 */
function initSliders() {
    const sliders = [
        { id: 'carDistance', suffix: ' km', displayId: 'carDistanceValue' },
        { id: 'homeSize', suffix: ' m²', displayId: 'homeSizeValue' },
        { id: 'meatMeals', suffix: ' repas', displayId: 'meatMealsValue' },
        { id: 'clothes', suffix: ' articles', displayId: 'clothesValue' }
    ];
    
    sliders.forEach(slider => {
        const input = document.getElementById(slider.id);
        const display = document.getElementById(slider.displayId);
        
        if (input && display) {
            input.addEventListener('input', function() {
                display.textContent = this.value + slider.suffix;
                
                // Animation de pulsation sur le texte
                display.classList.add('count-up');
                setTimeout(() => display.classList.remove('count-up'), 300);
            });
        }
    });
}

/**
 * Initialise les compteurs (+ / -)
 */
function initCounters() {
    const counters = [
        { plus: 'flightPlus', minus: 'flightMinus', display: 'flightCount', input: 'flights', max: 20, min: 0 },
        { plus: 'peoplePlus', minus: 'peopleMinus', display: 'peopleCount', input: 'people', max: 10, min: 1 },
        { plus: 'electronicsPlus', minus: 'electronicsMinus', display: 'electronicsCount', input: 'electronics', max: 10, min: 0 }
    ];
    
    counters.forEach(counter => {
        const plusBtn = document.getElementById(counter.plus);
        const minusBtn = document.getElementById(counter.minus);
        const display = document.getElementById(counter.display);
        const input = document.getElementById(counter.input);
        
        if (plusBtn && minusBtn && display && input) {
            let value = parseInt(input.value) || 0;
            
            plusBtn.addEventListener('click', function() {
                if (value < counter.max) {
                    value++;
                    updateCounter(display, input, value);
                }
            });
            
            minusBtn.addEventListener('click', function() {
                if (value > counter.min) {
                    value--;
                    updateCounter(display, input, value);
                }
            });
        }
    });
}

/**
 * Met à jour l'affichage d'un compteur avec animation
 */
function updateCounter(display, input, value) {
    display.style.transform = 'scale(0.8)';
    display.style.opacity = '0.5';
    
    setTimeout(() => {
        display.textContent = value;
        input.value = value;
        display.style.transform = 'scale(1.2)';
        display.style.opacity = '1';
        
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 100);
    }, 100);
}

/**
 * Initialise les cartes d'options sélectionnables
 */
function initOptionCards() {
    // Regrouper les option cards par parent (pour n'en sélectionner qu'une)
    const optionGroups = document.querySelectorAll('.mb-8');
    
    optionGroups.forEach(group => {
        const cards = group.querySelectorAll('.option-card');
        const hiddenInput = group.querySelector('input[type="hidden"]');
        
        if (cards.length > 0) {
            cards.forEach(card => {
                card.addEventListener('click', function() {
                    // Désélectionner toutes les cartes du groupe
                    cards.forEach(c => c.classList.remove('selected'));
                    
                    // Sélectionner celle-ci
                    this.classList.add('selected');
                    
                    // Mettre à jour l'input caché
                    if (hiddenInput) {
                        hiddenInput.value = this.dataset.value;
                    }
                    
                    // Gérer l'affichage de la section viande
                    if (hiddenInput && hiddenInput.id === 'diet') {
                        const meatSection = document.getElementById('meatSection');
                        if (meatSection) {
                            if (this.dataset.value === 'vegan' || this.dataset.value === 'vegetarian') {
                                meatSection.style.display = 'none';
                            } else {
                                meatSection.style.display = 'block';
                            }
                        }
                    }
                });
            });
        }
    });
}

// ============================================
// Calcul de l'empreinte carbone
// ============================================

/**
 * Collecte les données du formulaire
 * @returns {Object} Les données du formulaire
 */
function collectFormData() {
    return {
        transport: {
            carDistance: parseInt(document.getElementById('carDistance')?.value) || 0,
            carType: document.getElementById('carType')?.value || 'none',
            flights: parseInt(document.getElementById('flights')?.value) || 0
        },
        housing: {
            homeSize: parseInt(document.getElementById('homeSize')?.value) || 0,
            heatingType: document.getElementById('heatingType')?.value || 'electrique',
            people: parseInt(document.getElementById('people')?.value) || 1
        },
        food: {
            diet: document.getElementById('diet')?.value || 'omnivore',
            meatMeals: parseInt(document.getElementById('meatMeals')?.value) || 0,
            localFood: document.getElementById('localFood')?.checked || false
        },
        consumption: {
            clothes: parseInt(document.getElementById('clothes')?.value) || 0,
            electronics: parseInt(document.getElementById('electronics')?.value) || 0,
            recycling: document.getElementById('recycling')?.checked || false
        }
    };
}

/**
 * Calcule l'empreinte carbone totale
 * @param {Object} data - Les données du formulaire
 * @returns {Object} Les résultats détaillés
 */
function calculateCarbonFootprint(data) {
    // Transport
    const carEmission = data.transport.carDistance * 52 * EMISSION_FACTORS.transport.car[data.transport.carType];
    const flightEmission = data.transport.flights * EMISSION_FACTORS.transport.flight;
    const transportTotal = (carEmission + flightEmission) / 1000; // Convertir en tonnes
    
    // Logement (divisé par nombre de personnes)
    const heatingEmission = data.housing.homeSize * EMISSION_FACTORS.housing.heating[data.housing.heatingType];
    const baseEmission = EMISSION_FACTORS.housing.base;
    const housingTotal = ((heatingEmission + baseEmission) / data.housing.people) / 1000;
    
    // Alimentation
    let foodEmission = EMISSION_FACTORS.food.diet[data.food.diet];
    if (data.food.diet === 'omnivore') {
        foodEmission += data.food.meatMeals * 52 * (EMISSION_FACTORS.food.meat / 10);
    }
    if (data.food.localFood) {
        foodEmission += EMISSION_FACTORS.food.localBonus;
    }
    const foodTotal = Math.max(foodEmission, 500) / 1000;
    
    // Consommation
    let consumptionEmission = data.consumption.clothes * EMISSION_FACTORS.consumption.clothes;
    consumptionEmission += data.consumption.electronics * EMISSION_FACTORS.consumption.electronics;
    if (data.consumption.recycling) {
        consumptionEmission += EMISSION_FACTORS.consumption.recyclingBonus;
    }
    const consumptionTotal = Math.max(consumptionEmission, 0) / 1000;
    
    // Total
    const total = transportTotal + housingTotal + foodTotal + consumptionTotal;
    
    return {
        transport: parseFloat(transportTotal.toFixed(2)),
        housing: parseFloat(housingTotal.toFixed(2)),
        food: parseFloat(foodTotal.toFixed(2)),
        consumption: parseFloat(consumptionTotal.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        data: data // Conserver les données pour les conseils personnalisés
    };
}

/**
 * Détermine le niveau d'empreinte
 * @param {number} total - Empreinte totale en tonnes
 * @returns {Object} Le niveau correspondant
 */
function getLevel(total) {
    for (const [key, level] of Object.entries(LEVELS)) {
        if (total <= level.max) {
            return { ...level, key };
        }
    }
    return LEVELS.veryHigh;
}

// ============================================
// Affichage des résultats
// ============================================

/**
 * Affiche les résultats avec animations impressionnantes
 * @param {Object} results - Les résultats du calcul
 */
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const form = document.getElementById('carbonForm');
    
    // Cacher le formulaire
    form.style.opacity = '0';
    form.style.transform = 'translateY(-30px)';
    
    setTimeout(() => {
        form.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        
        // Animation d'entrée des résultats
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(30px)';
        
        requestAnimationFrame(() => {
            resultsSection.style.transition = 'all 0.6s ease';
            resultsSection.style.opacity = '1';
            resultsSection.style.transform = 'translateY(0)';
        });
        
        // Animer le cercle de progression
        animateCircle(results.total);
        
        // Animer le nombre
        animateNumber('resultValue', results.total, 1500);
        
        // Afficher le niveau
        displayLevel(results.total);
        
        // Afficher les barres de catégories
        setTimeout(() => displayCategoryBars(results), 800);
        
        // Générer et afficher les conseils personnalisés
        setTimeout(() => displayPersonalizedTips(results), 1200);
        
    }, 400);
}

/**
 * Anime le cercle de progression SVG
 * @param {number} total - Empreinte totale
 */
function animateCircle(total) {
    const circle = document.getElementById('progressCircle');
    const circumference = 283; // 2 * PI * r (r = 45)
    
    // Calculer le pourcentage (max 15 tonnes = 100%)
    const percentage = Math.min(total / 15, 1);
    const offset = circumference - (percentage * circumference);
    
    // Déterminer la couleur selon le niveau
    const level = getLevel(total);
    circle.style.stroke = level.color;
    
    // Animation
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        circle.style.strokeDashoffset = offset;
    }, 300);
}

/**
 * Anime un nombre de 0 à la valeur finale
 * @param {string} elementId - ID de l'élément
 * @param {number} target - Valeur cible
 * @param {number} duration - Durée en ms
 */
function animateNumber(elementId, target, duration) {
    const element = document.getElementById(elementId);
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const current = start + (target - start) * easeOut;
        element.textContent = current.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Affiche le niveau d'empreinte
 * @param {number} total - Empreinte totale
 */
function displayLevel(total) {
    const level = getLevel(total);
    const levelDiv = document.getElementById('resultLevel');
    const comparisonDiv = document.getElementById('resultComparison');
    
    // Moyenne française: environ 9-10 tonnes CO2/an
    const frenchAverage = 9.5;
    const comparison = ((total / frenchAverage) * 100).toFixed(0);
    
    levelDiv.innerHTML = `
        <span class="inline-flex items-center px-4 py-2 rounded-full text-white font-semibold" 
              style="background-color: ${level.color}">
            ${level.emoji} ${level.label}
        </span>
    `;
    
    let comparisonText;
    if (total < frenchAverage) {
        comparisonText = `Vous émettez <strong>${(100 - comparison)}% de moins</strong> que la moyenne française ! 🎉`;
    } else if (total > frenchAverage) {
        comparisonText = `Vous émettez <strong>${comparison - 100}% de plus</strong> que la moyenne française (${frenchAverage} t/an).`;
    } else {
        comparisonText = `Vous êtes dans la moyenne française (${frenchAverage} t/an).`;
    }
    
    comparisonDiv.innerHTML = comparisonText;
}

/**
 * Affiche les barres de progression par catégorie
 * @param {Object} results - Les résultats
 */
function displayCategoryBars(results) {
    const categories = ['transport', 'logement', 'alimentation', 'consommation'];
    const values = [results.transport, results.housing, results.food, results.consumption];
    const maxValue = Math.max(...values);
    
    categories.forEach((cat, index) => {
        const container = document.getElementById(`${cat}Result`);
        if (container) {
            const valueSpan = container.querySelector('.value');
            const bar = container.querySelector('.bar');
            
            if (valueSpan) valueSpan.textContent = values[index].toFixed(1);
            
            if (bar) {
                const percentage = (values[index] / maxValue) * 100;
                setTimeout(() => {
                    bar.style.width = `${Math.max(percentage, 5)}%`;
                }, index * 150);
            }
        }
    });
}

/**
 * Génère et affiche des conseils personnalisés
 * @param {Object} results - Les résultats avec les données originales
 */
function displayPersonalizedTips(results) {
    const container = document.getElementById('tipsContainer');
    const tips = [];
    const data = results.data;
    
    // Conseils basés sur le transport
    if (data.transport.carType !== 'none' && data.transport.carDistance > 100) {
        tips.push({
            icon: '🚲',
            title: 'Privilégiez les alternatives',
            text: 'Le vélo ou les transports en commun pour les trajets courts peuvent réduire significativement votre empreinte.',
            impact: '-0.5 t CO₂/an'
        });
    }
    
    if (data.transport.flights > 4) {
        tips.push({
            icon: '🚆',
            title: 'Réduisez les vols',
            text: 'Privilégiez le train pour les voyages en Europe, un aller-retour Paris-Nice en train = 90% de CO₂ en moins.',
            impact: '-1.5 t CO₂/an'
        });
    }
    
    // Conseils sur le logement
    if (data.housing.heatingType === 'fioul' || data.housing.heatingType === 'gaz') {
        tips.push({
            icon: '🌡️',
            title: 'Optimisez votre chauffage',
            text: 'Baissez d\'1°C = 7% d\'économie. Pensez à isoler et à passer à une pompe à chaleur.',
            impact: '-0.8 t CO₂/an'
        });
    }
    
    // Conseils sur l'alimentation
    if (data.food.diet === 'omnivore' && data.food.meatMeals > 7) {
        tips.push({
            icon: '🥗',
            title: 'Réduisez la viande',
            text: 'Remplacez 2 repas carnés par semaine par des alternatives végétales.',
            impact: '-0.6 t CO₂/an'
        });
    }
    
    if (!data.food.localFood) {
        tips.push({
            icon: '🌽',
            title: 'Mangez local et de saison',
            text: 'Les produits locaux parcourent moins de kilomètres et sont souvent plus frais.',
            impact: '-0.2 t CO₂/an'
        });
    }
    
    // Conseils sur la consommation
    if (data.consumption.clothes > 20) {
        tips.push({
            icon: '👕',
            title: 'Mode durable',
            text: 'Privilégiez la seconde main et les vêtements de qualité qui durent plus longtemps.',
            impact: '-0.3 t CO₂/an'
        });
    }
    
    if (!data.consumption.recycling) {
        tips.push({
            icon: '♻️',
            title: 'Triez vos déchets',
            text: 'Le tri sélectif permet de recycler les matériaux et réduire l\'enfouissement.',
            impact: '-0.1 t CO₂/an'
        });
    }
    
    // Limiter à 4 conseils les plus pertinents
    const displayedTips = tips.slice(0, 4);
    
    // Générer le HTML
    const tipsHTML = displayedTips.map((tip, index) => `
        <div class="flex items-start p-4 bg-eco-bg rounded-xl slide-up" style="animation-delay: ${index * 100}ms">
            <span class="text-2xl mr-3">${tip.icon}</span>
            <div class="flex-1">
                <p class="font-semibold text-gray-800">${tip.title}</p>
                <p class="text-sm text-gray-600 mb-1">${tip.text}</p>
                <span class="text-xs font-medium text-eco-green">${tip.impact}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = tipsHTML || '<p class="text-gray-500">Bravo ! Votre empreinte est déjà excellente. Continuez ainsi !</p>';
}

/**
 * Réinitialise le calculateur
 */
function resetCalculator() {
    const resultsSection = document.getElementById('resultsSection');
    const form = document.getElementById('carbonForm');
    
    resultsSection.style.opacity = '0';
    
    setTimeout(() => {
        resultsSection.classList.add('hidden');
        form.classList.remove('hidden');
        
        // Réinitialiser les étapes
        for (let i = 1; i <= totalSteps; i++) {
            const section = document.getElementById(`step${i}`);
            if (i === 1) {
                section.classList.remove('hidden');
                section.style.opacity = '1';
                section.style.transform = 'translateX(0)';
            } else {
                section.classList.add('hidden');
            }
        }
        
        currentStep = 1;
        updateProgressIndicator();
        
        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
        
    }, 300);
}

// ============================================
// Soumission du formulaire
// ============================================

/**
 * Sauvegarde les résultats en base de données via API PHP
 * @param {Object} results - Les résultats du calcul
 */
function saveResultsToDatabase(results) {
    const payload = {
        transport_co2: results.transport,
        alimentation_co2: results.food,
        logement_co2: results.housing,
        consommation_co2: results.consumption,
        total_co2: results.total,
        details: results.data
    };
    
    // Appel API asynchrone (ne bloque pas l'affichage)
    fetch('php/sauvegarder_calcul.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Calcul sauvegardé en BDD:', data.calcul_id);
        } else {
            console.warn('⚠️ Sauvegarde BDD:', data.message);
        }
    })
    .catch(error => {
        // Silencieux - ne pas bloquer l'utilisateur
        console.log('ℹ️ Sauvegarde locale uniquement (BDD non disponible)');
    });
}

/**
 * Gère la soumission du formulaire
 * @param {Event} event - L'événement de soumission
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Collecter les données
    const formData = collectFormData();
    
    // Calculer l'empreinte
    const results = calculateCarbonFootprint(formData);
    
    // Sauvegarder dans localStorage pour usage futur
    localStorage.setItem('ecotrack_last_calculation', JSON.stringify({
        date: new Date().toISOString(),
        results: results
    }));
    
    // Sauvegarder en base de données (asynchrone)
    saveResultsToDatabase(results);
    
    // Scroll vers le haut avant d'afficher les résultats
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Afficher les résultats après un court délai
    setTimeout(() => {
        displayResults(results);
    }, 500);
}

// ============================================
// Initialisation
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les composants interactifs
    initSliders();
    initCounters();
    initOptionCards();
    
    // Gérer la soumission du formulaire
    const form = document.getElementById('carbonForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialiser l'indicateur de progression
    updateProgressIndicator();
    
    // Ajouter des transitions CSS aux sections
    document.querySelectorAll('.step-section').forEach(section => {
        section.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    
    console.log('🌱 EcoTrack Calculateur initialisé');
});

// Exposer les fonctions nécessaires globalement
window.nextStep = nextStep;
window.prevStep = prevStep;
window.resetCalculator = resetCalculator;
