/**
 * EcoTrack - JavaScript Principal
 * Auteur: KOUAM Brice
 * Projet: Technologie de l'Internet - ENSIM
 */

// ===== MENU MOBILE =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Fermer le menu mobile lors du clic sur un lien
    const mobileLinks = mobileMenu?.querySelectorAll('a');
    mobileLinks?.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('active');
        });
    });
});

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ===== ANIMATION DES COMPTEURS STATISTIQUES =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString('fr-FR');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('fr-FR');
        }
    }
    
    updateCounter();
}

// Observer pour déclencher l'animation quand visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statUsers = document.getElementById('stat-users');
            const statCalculs = document.getElementById('stat-calculs');
            const statCO2 = document.getElementById('stat-co2');
            const statConseils = document.getElementById('stat-conseils');
            
            if (statUsers) animateCounter(statUsers, 2547);
            if (statCalculs) animateCounter(statCalculs, 15890);
            if (statCO2) animateCounter(statCO2, 324);
            if (statConseils) animateCounter(statConseils, 8756);
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.stat-item')?.parentElement;
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// ===== ANIMATIONS AU SCROLL =====
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('article, section > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        fadeObserver.observe(el);
    });
});

// ===== SMOOTH SCROLL POUR LES ANCRES =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== GESTION DU LECTEUR AUDIO =====
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('background-music');
    if (audio) {
        // Réduire le volume par défaut
        audio.volume = 0.3;
        
        // Sauvegarder l'état du lecteur dans localStorage
        audio.addEventListener('play', () => {
            localStorage.setItem('ecotrack_music_playing', 'true');
        });
        
        audio.addEventListener('pause', () => {
            localStorage.setItem('ecotrack_music_playing', 'false');
        });
        
        // Restaurer l'état précédent
        const wasPlaying = localStorage.getItem('ecotrack_music_playing');
        if (wasPlaying === 'true') {
            // Note: autoplay bloqué par les navigateurs, l'utilisateur doit interagir
            console.log('Musique prête à être jouée');
        }
    }
});

// ===== EFFET PARALLAX LÉGER SUR HERO =====
window.addEventListener('scroll', function() {
    const heroImage = document.querySelector('#hero img');
    if (heroImage) {
        const scrolled = window.scrollY;
        heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// ===== FONCTION UTILITAIRE : DEBOUNCE =====
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ===== FONCTION UTILITAIRE : FORMAT NOMBRE =====
function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

// ===== AFFICHAGE/MASQUAGE DES DIVS (comme demandé dans TD_JS) =====
let divsVisible = true;

function toggleDivs() {
    const divs = document.querySelectorAll('main div');
    divsVisible = !divsVisible;
    
    divs.forEach(div => {
        div.style.display = divsVisible ? '' : 'none';
    });
    
    const toggleBtn = document.getElementById('toggle-divs-btn');
    if (toggleBtn) {
        toggleBtn.textContent = divsVisible ? 'Masquer les blocs' : 'Afficher les blocs';
    }
}

// ===== CHANGEMENT DE COULEUR AU SURVOL D'IMAGE (comme demandé dans TD_JS) =====
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('main img');
    const originalBgColor = document.body.style.backgroundColor;
    
    images.forEach(img => {
        img.addEventListener('mouseenter', function() {
            document.body.style.backgroundColor = '#f0fdf4';
            document.querySelectorAll('h1, h2, h3').forEach(title => {
                title.style.color = '#15803d';
            });
        });
        
        img.addEventListener('mouseleave', function() {
            document.body.style.backgroundColor = originalBgColor || '';
            document.querySelectorAll('h1, h2, h3').forEach(title => {
                title.style.color = '';
            });
        });
    });
});

// ===== CONSOLE LOG POUR DEBUGGING =====
console.log('🌱 EcoTrack - JavaScript chargé avec succès!');
console.log('📊 Version: 1.0.0');
console.log('👨‍💻 Auteur: KOUAM Brice');
