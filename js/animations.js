(function() {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        document.querySelectorAll('.section-header, .section-content, #hero-subtitle, .hero-hint, #scroll-indicator, .skill-node').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    function splitText(el) {
        const text = el.textContent;
        el.textContent = '';
        el.style.opacity = '1';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? ' ' : char;
            span.style.display = 'inline-block';
            span.className = 'char';
            el.appendChild(span);
        });
        return el.querySelectorAll('.char');
    }

    // Hero entrance
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .from('#hero-name', {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        })
        .from('#hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-hint', {
            opacity: 0,
            duration: 0.6
        }, '-=0.2')
        .from('#scroll-indicator', {
            opacity: 0,
            y: -10,
            duration: 0.5
        }, '-=0.1');

    // Scroll progress for Three.js scene
    ScrollTrigger.create({
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            if (window.updateSceneProgress) {
                window.updateSceneProgress(self.progress);
            }
        }
    });

    // Section headers reveal
    document.querySelectorAll('.section-header').forEach(header => {
        const chars = splitText(header);

        ScrollTrigger.create({
            trigger: header,
            start: 'top 80%',
            once: true,
            onEnter: () => {
                gsap.from(chars, {
                    y: 60,
                    opacity: 0,
                    rotateX: -90,
                    stagger: 0.03,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                });
            }
        });
    });

    // Section content reveal
    document.querySelectorAll('.section-content').forEach(content => {
        ScrollTrigger.create({
            trigger: content,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(content, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                });
            }
        });

        gsap.set(content, { opacity: 0, y: 40 });
    });

    // Timeline items stagger
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.from(item, {
                    opacity: 0,
                    x: -30,
                    duration: 0.6,
                    delay: i * 0.15,
                    ease: 'power2.out'
                });
            }
        });
    });

    // Skill nodes stagger
    const skillNodes = document.querySelectorAll('.skill-node');
    ScrollTrigger.create({
        trigger: '#section-skills',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            gsap.to(skillNodes, {
                opacity: 1,
                y: 0,
                stagger: {
                    each: 0.08,
                    from: 'random'
                },
                duration: 0.5,
                ease: 'back.out(1.4)'
            });
        }
    });

    // Skill nodes floating animation
    skillNodes.forEach((node, i) => {
        gsap.to(node, {
            y: `${Math.sin(i) * 8}`,
            x: `${Math.cos(i) * 5}`,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
        });
    });

    // Project cards 3D tilt
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // Project cards scroll reveal
    projectCards.forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.from(card, {
                    opacity: 0,
                    y: 50,
                    rotateX: -10,
                    duration: 0.7,
                    delay: i * 0.15,
                    ease: 'power2.out'
                });
            }
        });
    });

    // Contact links
    const contactLinks = document.querySelectorAll('.contact-link');
    ScrollTrigger.create({
        trigger: '#section-contact',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.from(contactLinks, {
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.4)'
            });
        }
    });

    // Hero fade out on scroll
    ScrollTrigger.create({
        trigger: '#section-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
            const heroName = document.getElementById('hero-name');
            const heroSub = document.getElementById('hero-subtitle');
            const heroHint = document.querySelector('.hero-hint');
            const opacity = 1 - self.progress * 2;
            const yShift = self.progress * -80;

            if (heroName) {
                heroName.style.opacity = Math.max(0, opacity);
                heroName.style.transform = `translateY(${yShift}px)`;
            }
            if (heroSub) {
                heroSub.style.opacity = Math.max(0, opacity);
                heroSub.style.transform = `translateY(${yShift * 0.7}px)`;
            }
            if (heroHint) {
                heroHint.style.opacity = Math.max(0, opacity);
            }
        }
    });
})();
