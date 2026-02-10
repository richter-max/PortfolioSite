// ============================================
// MATRIX BACKGROUND ANIMATION
// ============================================
function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - security themed
    const chars = '01{}[]<>$#@!0xABCDEF'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        // Fade effect
        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw characters
        ctx.fillStyle = '#00ff9f';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(text, x, y);

            // Reset drop to top randomly
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    const cursorDot = document.querySelector('.cursor-dot');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor movement
    function updateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.2;
        cursorY += dy * 0.2;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .magnetic, .bento-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// ============================================
// TYPING ANIMATION
// ============================================
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    const messages = [
        'Building secure systems with clarity, automation, and discipline.',
        'Understanding real-world attack surfaces.',
        'Security engineering over theoretical abstractions.'
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentMessage = messages[messageIndex];

        if (isDeleting) {
            typingElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 80;

        if (!isDeleting && charIndex === currentMessage.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
            typeSpeed = 500; // Pause before next message
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing after a short delay
    setTimeout(type, 1000);
}

// ============================================
// 3D CARD TILT EFFECT
// ============================================
function init3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Reduced rotation intensity from /20 to /8 for gentler movement
            const rotateX = (y - centerY) / 8;
            const rotateY = (centerX - x) / 8;

            card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.01, 1.01, 1.01)
      `;

            // Update spotlight position
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
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const strength = 0.3;

            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all bento cards
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
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
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// ACCESSIBILITY: REDUCED MOTION
// ============================================
function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.body.classList.add('reduced-motion');
        // Disable custom cursor for reduced motion
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
}

// ============================================
// BACKGROUND IMAGES
// ============================================
function initBackgroundImages() {
    const elementsWithBg = document.querySelectorAll('[data-bg]');
    elementsWithBg.forEach(element => {
        const bgUrl = element.getAttribute('data-bg');
        if (bgUrl) {
            element.style.backgroundImage = `url('${bgUrl}')`;
        }
    });
}

// ============================================
// INITIALIZE ALL EFFECTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkReducedMotion();
    initBackgroundImages();
    initMatrixBackground();
    initCustomCursor();
    initTypingAnimation();
    init3DTilt();
    initMagneticEffect();
    initScrollAnimations();
    initSmoothScroll();

    console.log('🔒 Portfolio initialized - Security Engineer Mode');
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
