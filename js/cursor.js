(function() {
    'use strict';

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) return;

    const cursor = document.getElementById('custom-cursor');
    const ring = cursor.querySelector('.cursor-ring');
    const dot = cursor.querySelector('.cursor-dot');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;

        ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
        dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

        requestAnimationFrame(updateCursor);
    }

    updateCursor();

    const hoverTargets = document.querySelectorAll('a, button, input, .project-card, .skill-node, .contact-link');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
})();
