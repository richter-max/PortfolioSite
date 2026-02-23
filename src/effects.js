import { aegisDemos, securityChallenge } from './data/demos.js';


// ============================================
// TERMINAL DEMO
// ============================================
function initTerminalDemo() {
    const tabs = document.querySelectorAll('.terminal-tab');
    const commandLine = document.querySelector('#terminal-command-line .command-text');
    const resultText = document.getElementById('terminal-result-text');
    const explanationText = document.querySelector('#terminal-explanation .context-text');

    if (!tabs.length || !commandLine || !resultText || !explanationText) return;

    let isTyping = false;

    async function runCommand(cmdId) {
        if (isTyping) return;
        isTyping = true;

        const demo = aegisDemos.scenarios.find(s => s.id === cmdId);
        if (!demo) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Reset display
        commandLine.parentElement.classList.add('typing');
        commandLine.textContent = '';
        resultText.style.opacity = '0';
        resultText.style.animation = 'none';

        if (prefersReducedMotion) {
            commandLine.textContent = demo.command;
        } else {
            // Typewriter effect for command
            const fullCommand = demo.command;
            for (let i = 0; i <= fullCommand.length; i++) {
                commandLine.textContent = fullCommand.slice(0, i);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        commandLine.parentElement.classList.remove('typing');

        // Show output
        resultText.textContent = demo.output;
        resultText.style.animation = 'fade-in 0.5s ease forwards';

        // Update context
        explanationText.textContent = demo.explanation;

        isTyping = false;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            runCommand(tab.dataset.cmd);
        });
    });
}

// ============================================
// SECURITY CHALLENGE
// ============================================
function initSecurityChallenge() {
    const options = document.querySelectorAll('.challenge-option');
    const resultBox = document.getElementById('challenge-result-box');
    const resultStatus = resultBox?.querySelector('.result-status');
    const resultDetails = resultBox?.querySelector('.result-explanation');
    const resultLink = resultBox?.querySelector('.result-link');

    if (!options.length || !resultBox) return;

    options.forEach(option => {
        option.addEventListener('click', () => {
            if (resultBox.classList.contains('correct-revealed')) return;

            const choiceId = option.dataset.choice;
            const choice = securityChallenge.choices.find(c => c.id === choiceId);

            if (!choice) return;

            options.forEach(opt => opt.classList.remove('correct', 'wrong'));

            resultBox.classList.remove('hidden');
            resultDetails.textContent = choice.explanation;
            resultLink.href = choice.docLink;

            if (choice.isCorrect) {
                option.classList.add('correct');
                resultStatus.textContent = "Correct Selection";
                resultStatus.style.color = "var(--neon-cyan)";
                resultBox.style.borderLeftColor = "var(--neon-cyan)";
                resultBox.classList.add('correct-revealed');
                options.forEach(opt => opt.style.pointerEvents = 'none');
            } else {
                option.classList.add('wrong');
                resultStatus.textContent = "Incorrect Analysis";
                resultStatus.style.color = "#ff5f56";
                resultBox.style.borderLeftColor = "#ff5f56";
            }
        });
    });
}

// ============================================
// PROJECT ACCORDIONS
// ============================================
function initProjectAccordions() {
    const triggers = document.querySelectorAll('.accordion-trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !isExpanded);
        });
    });
}

// ============================================
// 3D CARD TILT EFFECT
// ============================================
function init3DTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 40;
            const rotateY = (centerX - x) / 40;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;

            const mouseXPercent = (x / rect.width) * 100;
            const mouseYPercent = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
            card.style.setProperty('--mouse-y', `${mouseYPercent}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ============================================
// MAGNETIC EFFECT
// ============================================
function initMagneticEffect() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('visible');
                observer.unobserve(el);

                const children = el.querySelectorAll('.reveal-child');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${(i + 1) * 70}ms`;
                    child.classList.add('visible');
                });
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.06
    });

    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => {
        if (!el.style.transitionDelay) {
            const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
            const idx = siblings.indexOf(el);
            if (idx > 0 && idx < 6) {
                el.style.transitionDelay = `${idx * 60}ms`;
            }
        }
        observer.observe(el);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navLinks = document.getElementById('nav-links');
                const hamburger = document.getElementById('nav-hamburger');
                if (navLinks && navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    hamburger.setAttribute('aria-label', 'Open menu');
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(progress, 100)}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

// ============================================
// STICKY NAV
// ============================================
function initStickyNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ============================================
// ACTIVE SECTION TRACKING
// ============================================
function initActiveSection() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    const sectionIds = Array.from(navLinks).map(l => l.getAttribute('href').slice(1));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    });

    sections.forEach(section => observer.observe(section));
}

// ============================================
// MOBILE HAMBURGER MENU
// ============================================
function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Open menu');
        }
    });
}

// ============================================
// PARALLAX-LITE
// ============================================
function initParallaxLite() {
    if (window.matchMedia('(max-width: 767px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    let ticking = false;

    function applyParallax() {
        const scrollY = window.scrollY;
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const elementCenter = rect.top + rect.height / 2;
            const distance = elementCenter - viewportCenter;
            const offset = Math.max(-10, Math.min(10, distance * 0.04));
            el.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }, { passive: true });

    applyParallax();
}

// ============================================
// BACKGROUND IMAGES
// ============================================
function initBackgroundImages() {
    const elementsWithBg = document.querySelectorAll('[data-bg]');
    elementsWithBg.forEach(element => {
        const bgUrl = element.getAttribute('data-bg');
        if (bgUrl) element.style.backgroundImage = `url('${bgUrl}')`;
    });
}

// ============================================
// ACCESSIBILITY: REDUCED MOTION
// ============================================
function handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.documentElement.classList.add('reduce-motion');
    }
}

// ============================================
// JSON INSPECTOR — TAB SWITCHING
// ============================================
function initJsonInspector() {
    const tabs = document.querySelectorAll('.json-tab');
    const outputs = document.querySelectorAll('.json-output');

    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;

            // Switch tab active state
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Switch output panel
            const policy = tab.dataset.policy;
            outputs.forEach(out => out.classList.remove('active'));
            const target = document.getElementById(`json-${policy}`);
            if (target) target.classList.add('active');
        });
    });
}

// ============================================
// INITIALIZE ALL EFFECTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    handleReducedMotion();
    initBackgroundImages();
    init3DTilt();
    initMagneticEffect();
    initScrollAnimations();
    initSmoothScroll();
    initScrollProgress();
    initStickyNav();
    initActiveSection();
    initMobileMenu();
    initParallaxLite();
    initTerminalDemo();
    initSecurityChallenge();
    initProjectAccordions();
    initJsonInspector();
});

// ============================================
// PERFORMANCE MONITORING
// ============================================
if (window.performance) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page load time: ${pageLoadTime}ms`);
    });
}
