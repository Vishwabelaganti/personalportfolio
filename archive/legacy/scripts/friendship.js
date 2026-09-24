// Initialize particles and apply themes when the page is fully loaded
window.addEventListener('load', function() {
	// Set up particles.js
	if (typeof particlesJS === 'function') {
		particlesJS('particles-js', {
			particles: {
				number: { value: 25, density: { enable: true, value_area: 1000 } },
				color: { value: ['#d4af37', '#6c63ff'] },
				shape: { type: "circle" },
				opacity: { value: 0.5, random: true },
				size: { value: 3, random: true },
				line_linked: { 
					enable: true, 
					distance: 150, 
					color: "#d4af37", 
					opacity: 0.4, 
					width: 1 
				},
				move: { 
					enable: true, 
					speed: 1, 
					direction: "none", 
					random: false,
					straight: false,
					out_mode: "out",
					bounce: false
				}
			}
		});
	}
	
	// Apply saved customizations
	setTimeout(() => {
		applyBackgroundTheme(localStorage.getItem('bgTheme') || 'professional');
		applyParticleEffect(localStorage.getItem('particleEffect') || 'stars');
		applyCharacterSticker(localStorage.getItem('characterSticker') || 'none');
		applyClockStyle(localStorage.getItem('clockStyle') || 'none');
	}, 500);
});
