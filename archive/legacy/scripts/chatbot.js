// Restored gold/black chatbot with fun replies, dad jokes, and friendship-only arcade
document.addEventListener('DOMContentLoaded', () => {
	try {
		// 0) Remove the temporary minimal chatbot if present
		const tempIcon = document.getElementById('vc-chat-icon');
		if (tempIcon) tempIcon.remove();
		const tempPanel = document.getElementById('vc-chat-panel');
		if (tempPanel) tempPanel.remove();

		// 1) Inject styles for the classic gold/black speech bubble
		const style = document.createElement('style');
		style.textContent = `
			#character-speech { 
				position: fixed; bottom: 160px; right: 20px; width: 360px; max-width: calc(100vw - 40px); max-height: 60vh; overflow: auto;
				background: #1e2130; color: #fff; border: 2px solid #d4af37; border-radius: 12px; padding: 14px; display: none; z-index: 9999;
				box-shadow: 0 0 20px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
			}
			/* Removed the speech bubble pointer */
			#character-speech.show { display: block; }
			#character-speech-text { color: #fff; line-height: 1.5; }
			#chatContainer { display: none; margin-top: 10px; gap: 10px; }
			#chatInput { 
				flex: 1; padding: 10px; background: #2a2e3d; color: #fff; 
				border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; 
			}
			#chatInput:focus { 
				outline: none;
				border-color: rgba(212,175,55,0.7);
				box-shadow: 0 0 5px rgba(212,175,55,0.3);
			}
			#chatSend { 
				padding: 10px 14px; background: #d4af37; color: #1e2130; 
				border: none; border-radius: 6px; cursor: pointer; font-weight: 700;
				transition: all 0.2s ease;
			}
			#chatSend:hover {
				background: #e5c158;
				box-shadow: 0 0 8px rgba(212,175,55,0.5);
			}
			.friendship-bar-wrapper { 
				margin: 0 0 12px 0; padding: 8px; 
				background: rgba(0,0,0,0.2); 
				border: 1px solid rgba(212,175,55,0.3); 
				border-radius: 8px; 
			}
			.chat-options-container button, .game-option-button { 
				background: rgba(212,175,55,0.15); 
				border: 1px solid rgba(212,175,55,0.3); 
				border-radius: 20px; padding: 8px 16px; 
				color: #fff; cursor: pointer;
				transition: all 0.2s ease;
			}
			.chat-options-container button:hover, .game-option-button:hover {
				background: rgba(212,175,55,0.3);
				border-color: rgba(212,175,55,0.5);
			}
			.game-container {
				background: rgba(30,33,48,0.95);
				border: 2px solid #d4af37;
				border-radius: 10px;
				padding: 15px;
				margin-top: 15px;
			}
			
			/* Mobile-specific chatbot styles */
			@media (max-width: 768px) {
				#character-speech { 
					bottom: 90px !important; 
					right: 10px !important; 
					width: calc(100vw - 20px) !important; 
					max-width: 350px !important;
					font-size: 14px;
					padding: 12px;
				}
				#chatInput { 
					font-size: 16px !important; /* Prevents zoom on iOS */
					padding: 12px;
					min-height: 44px; /* Minimum touch target size */
				}
				#chatSend { 
					padding: 12px 16px;
					min-height: 44px; /* Minimum touch target size */
					font-size: 14px;
				}
				.chat-options-container button, .game-option-button { 
					padding: 12px 16px;
					font-size: 14px;
					min-height: 44px; /* Touch-friendly button size */
					margin: 5px 2px;
				}
				.game-container {
					padding: 12px;
					margin-top: 10px;
				}
				.friendship-bar-wrapper {
					padding: 6px;
					margin-bottom: 10px;
				}
			}
			
			/* Very small screens */
			@media (max-width: 480px) {
				#character-speech {
					bottom: 80px !important;
					right: 5px !important;
					width: calc(100vw - 10px) !important;
					font-size: 13px;
					padding: 10px;
				}
				.chat-options-container button, .game-option-button {
					font-size: 13px;
					padding: 10px 12px;
				}
			}
		`;
		document.head.appendChild(style);

		// 2) Ensure required DOM nodes exist for the classic chatbot used by page scripts
		let speech = document.getElementById('character-speech');
		if (!speech) {
			speech = document.createElement('div');
			speech.id = 'character-speech';
			speech.className = 'character-speech';
			document.body.appendChild(speech);
		}
		let speechText = document.getElementById('character-speech-text');
		if (!speechText) {
			speechText = document.createElement('div');
			speechText.id = 'character-speech-text';
			speechText.className = 'speech-text';
			speech.appendChild(speechText);
		}
		let chatContainer = document.getElementById('chatContainer');
		if (!chatContainer) {
			chatContainer = document.createElement('div');
			chatContainer.id = 'chatContainer';
			chatContainer.style.display = 'flex'; // Changed to flex to make the chat function visible
			chatContainer.style.flexDirection = 'row';
			const input = document.createElement('input');
			input.id = 'chatInput';
			input.type = 'text';
			input.placeholder = 'Ask me anything...';
			const send = document.createElement('button');
			send.id = 'chatSend';
			send.type = 'button';
			send.textContent = 'Send';
			chatContainer.appendChild(input);
			chatContainer.appendChild(send);
			speech.appendChild(chatContainer);
		}

		// 3) Friendship bar + arcade (friendship-only) implementation
		function addFriendshipBarToChatbox() {
			const existing = speech.querySelector('#chatbox-friendship-bar-container');
			if (existing) existing.parentElement?.remove();
			const barWrapper = document.createElement('div');
			barWrapper.className = 'friendship-bar-wrapper';
			barWrapper.style.cursor = 'pointer';
			const title = document.createElement('div');
			title.textContent = 'Friendship Level (Click to customize)';
			title.style.fontSize = '12px';
			title.style.textAlign = 'center';
			title.style.color = '#ccc';
			title.style.marginBottom = '6px';
			const container = document.createElement('div');
			container.id = 'chatbox-friendship-bar-container';
			container.style.width = '100%';
			container.style.height = '8px';
			container.style.background = 'rgba(0,0,0,0.3)';
			container.style.borderRadius = '4px';
			container.style.position = 'relative';
			const bar = document.createElement('div');
			bar.id = 'chatbox-friendship-bar';
			bar.style.height = '100%';
			const level = parseInt(localStorage.getItem('friendshipLevel') || '0');
			bar.style.width = level + '%';
			bar.style.borderRadius = '4px';
			bar.style.transition = 'width .5s ease-in-out';
			bar.style.background = level < 30 ? 'linear-gradient(to right, #8B0000, #A52A2A)'
				: level < 70 ? 'linear-gradient(to right, #B8860B, #DAA520)'
				: 'linear-gradient(to right, #D4AF37, #FFD700)';
			const value = document.createElement('div');
			value.id = 'chatbox-friendship-level';
			value.textContent = level + '%';
			value.style.position = 'absolute';
			value.style.right = '5px';
			value.style.top = '0';
			value.style.bottom = '0';
			value.style.display = 'flex';
			value.style.alignItems = 'center';
			value.style.fontSize = '10px';
			value.style.color = '#fff';
			value.style.textShadow = '0 0 2px rgba(0,0,0,.8)';
			container.appendChild(bar);
			container.appendChild(value);
			barWrapper.appendChild(title);
			barWrapper.appendChild(container);
			speech.insertBefore(barWrapper, speechText);
			
			// Add click handler to show friendship customization panel
			barWrapper.addEventListener('click', showFriendshipCustomizationPanel);
		}

		function updateUnlockedCodePieces(friendshipLevel) {
			let unlocked = 0;
			if (friendshipLevel >= 10) unlocked = 1;
			if (friendshipLevel >= 20) unlocked = 2;
			if (friendshipLevel >= 30) unlocked = 3;
			if (friendshipLevel >= 40) unlocked = 4;
			if (friendshipLevel >= 50) unlocked = 5;
			if (friendshipLevel >= 60) unlocked = 6;
			if (friendshipLevel >= 70) unlocked = 7;
			if (friendshipLevel >= 80) unlocked = 8;
			if (friendshipLevel >= 90) unlocked = 9;
			if (friendshipLevel >= 95) unlocked = 10;
			if (friendshipLevel >= 100) unlocked = 11;
			localStorage.setItem('unlockedKonamiPieces', String(unlocked));
			return unlocked;
		}

		function increaseFriendship(amount = 1) {
			let level = parseInt(localStorage.getItem('friendshipLevel') || '0');
			level = Math.min(100, Math.max(0, level + amount));
			localStorage.setItem('friendshipLevel', String(level));
			const bar = document.getElementById('chatbox-friendship-bar');
			const text = document.getElementById('chatbox-friendship-level');
			if (bar) {
				bar.style.width = level + '%';
				bar.style.background = level < 30 ? 'linear-gradient(to right, #8B0000, #A52A2A)'
					: level < 70 ? 'linear-gradient(to right, #B8860B, #DAA520)'
					: 'linear-gradient(to right, #D4AF37, #FFD700)';
			}
			if (text) text.textContent = level + '%';
			updateUnlockedCodePieces(level);
			return level;
		}

		function resetFriendship() {
			localStorage.setItem('friendshipLevel', '0');
			localStorage.setItem('unlockedKonamiPieces', '0');
			const bar = document.getElementById('chatbox-friendship-bar');
			const text = document.getElementById('chatbox-friendship-level');
			if (bar) { bar.style.width = '0%'; bar.style.background = 'linear-gradient(to right, #ff4e4e, #ff7e7e)'; }
			if (text) text.textContent = '0%';
			if (speechText) speechText.textContent = 'Friendship reset. Let\'s start fresh!';
		}
		
		// Friendship customization panel
		function showFriendshipCustomizationPanel() {
			const existing = document.getElementById('friendship-customization-panel');
			if (existing) existing.remove();
			
			const panel = document.createElement('div');
			panel.id = 'friendship-customization-panel';
			Object.assign(panel.style, {
				position: 'fixed', 
				top: '50%', 
				left: '50%', 
				transform: 'translate(-50%, -50%)', 
				width: 'min(600px, 90vw)',
				maxHeight: '85vh',
				overflowY: 'auto',
				background: 'rgba(30,33,48,0.95)', 
				border: '2px solid #d4af37', 
				borderRadius: '12px', 
				padding: '20px', 
				color: '#fff', 
				zIndex: '10002',
				boxShadow: '0 0 25px rgba(0,0,0,0.7)',
				backdropFilter: 'blur(10px)'
			});
			
			// Header
			const header = document.createElement('div');
			header.innerHTML = '<h2 style="color:#d4af37;text-align:center;margin-bottom:15px;">Friendship Customization</h2>';
			header.innerHTML += '<p style="text-align:center;margin-bottom:20px;color:#ccc;">Customize the website with your earned friendship points!</p>';
			panel.appendChild(header);
			
			// Friendship level display
			const level = parseInt(localStorage.getItem('friendshipLevel') || '0');
			const wrap = document.createElement('div'); 
			wrap.style.textAlign = 'center';
			wrap.style.padding = '10px';
			wrap.style.margin = '15px 0';
			wrap.style.border = '1px solid rgba(212,175,55,0.3)';
			wrap.style.borderRadius = '8px';
			wrap.style.background = 'rgba(0,0,0,0.2)';
			
			const title = document.createElement('div'); 
			title.textContent = 'Current Friendship Level:'; 
			title.style.marginBottom = '10px'; 
			title.style.fontSize = '16px';
			wrap.appendChild(title);
			
			const barC = document.createElement('div'); 
			Object.assign(barC.style, { 
				width: '100%', 
				height: '15px', 
				background: 'rgba(0,0,0,0.3)', 
				borderRadius: '8px', 
				overflow: 'hidden', 
				marginBottom: '8px', 
				border: '1px solid rgba(212,175,55,0.3)' 
			});
			
			const bar = document.createElement('div'); 
			bar.style.height = '100%'; 
			bar.style.width = level + '%';
			bar.style.background = level < 30 ? 'linear-gradient(to right, #8B0000, #A52A2A)'
				: level < 70 ? 'linear-gradient(to right, #B8860B, #DAA520)'
				: 'linear-gradient(to right, #D4AF37, #FFD700)';
			barC.appendChild(bar); 
			wrap.appendChild(barC);
			
			const value = document.createElement('div'); 
			value.textContent = level + '% Friendship Points'; 
			value.style.fontWeight = 'bold';
			value.style.color = level < 30 ? '#ff7e7e' : level < 70 ? '#ffeb3b' : '#d4af37';
			wrap.appendChild(value); 
			panel.appendChild(wrap);
			
			// Customization sections
			const sections = document.createElement('div');
			sections.style.display = 'grid';
			sections.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
			sections.style.gap = '20px';
			sections.style.marginTop = '20px';
			
			// 1. Background Theme
			const bgThemes = [
				{name: 'Professional', value: 'professional', required: 0},
				{name: 'Default Blue', value: 'blue', required: 10},
				{name: 'Space Gold', value: 'spacegold', required: 20},
				{name: 'Cyberpunk Night', value: 'cyberpunk', required: 30},
				{name: 'Golden Elegance', value: 'gold', required: 40},
				{name: 'Relaxing Sunset', value: 'sunset', required: 60},
				{name: 'Cosmic Journey', value: 'cosmic', required: 80}
			];
			
			sections.appendChild(createCustomizationSection('Background Theme', bgThemes, 'bgTheme', level, applyBackgroundTheme));
			
			// 2. Particle Effects
			const particles = [
				{name: 'Default Stars', value: 'stars', required: 0},
				{name: 'Geometric', value: 'geometric', required: 25},
				{name: 'Bubbles', value: 'bubbles', required: 45},
				{name: 'Fireflies', value: 'fireflies', required: 65},
				{name: 'Digital Rain', value: 'rain', required: 85}
			];
			
			sections.appendChild(createCustomizationSection('Particle Effects', particles, 'particleEffect', level, applyParticleEffect));
			
			// 3. Character Stickers
			const stickers = [
				{name: 'None', value: 'none', required: 0},
				{name: 'Cool Sunglasses', value: 'sunglasses', required: 30},
				{name: 'Developer Hat', value: 'devhat', required: 50},
				{name: 'Golden Aura', value: 'goldaura', required: 70},
				{name: 'Digital Wings', value: 'wings', required: 90}
			];
			
			sections.appendChild(createCustomizationSection('Character Stickers', stickers, 'characterSticker', level, applyCharacterSticker));
			
			// 4. Time of Day Clock
			const clockStyles = [
				{name: 'None', value: 'none', required: 0},
				{name: 'Digital Clock', value: 'digital', required: 15},
				{name: 'Analog Clock', value: 'analog', required: 35},
				{name: 'Weather Clock', value: 'weather', required: 55},
				{name: 'Dynamic Day/Night', value: 'daynight', required: 75}
			];
			
			sections.appendChild(createCustomizationSection('Time Display', clockStyles, 'clockStyle', level, applyClockStyle));
			
			panel.appendChild(sections);
			
			// Close button
			const closeBtn = document.createElement('button');
			closeBtn.textContent = 'Save & Close';
			closeBtn.style.display = 'block';
			closeBtn.style.margin = '25px auto 10px';
			closeBtn.style.padding = '10px 20px';
			closeBtn.style.background = 'linear-gradient(to right, #D4AF37, #FFD700)';
			closeBtn.style.color = '#1e2130';
			closeBtn.style.border = 'none';
			closeBtn.style.borderRadius = '6px';
			closeBtn.style.fontWeight = 'bold';
			closeBtn.style.cursor = 'pointer';
			closeBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
			
			closeBtn.onmouseover = () => {
				closeBtn.style.transform = 'translateY(-2px)';
				closeBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
			};
			
			closeBtn.onmouseout = () => {
				closeBtn.style.transform = 'translateY(0)';
				closeBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
			};
			
			closeBtn.onclick = () => panel.remove();
			
			panel.appendChild(closeBtn);
			document.body.appendChild(panel);
		}
		
		// Helper function to create a customization section
		function createCustomizationSection(title, options, storageKey, level, applyCallback) {
			const section = document.createElement('div');
			section.className = 'customization-section';
			section.style.border = '1px solid rgba(212,175,55,0.3)';
			section.style.borderRadius = '8px';
			section.style.padding = '15px';
			section.style.background = 'rgba(0,0,0,0.2)';
			
			const heading = document.createElement('h3');
			heading.textContent = title;
			heading.style.color = '#d4af37';
			heading.style.marginBottom = '12px';
			heading.style.fontSize = '16px';
			heading.style.borderBottom = '1px solid rgba(212,175,55,0.3)';
			heading.style.paddingBottom = '5px';
			section.appendChild(heading);
			
			const optionsContainer = document.createElement('div');
			optionsContainer.style.display = 'flex';
			optionsContainer.style.flexDirection = 'column';
			optionsContainer.style.gap = '8px';
			
			// Get currently selected option from localStorage
			const currentValue = localStorage.getItem(storageKey) || options[0].value;
			
			options.forEach(option => {
				const isLocked = level < option.required;
				const row = document.createElement('div');
				row.style.display = 'flex';
				row.style.alignItems = 'center';
				row.style.justifyContent = 'space-between';
				row.style.padding = '5px';
				row.style.borderRadius = '4px';
				row.style.background = currentValue === option.value ? 'rgba(212,175,55,0.2)' : 'transparent';
				row.style.border = currentValue === option.value ? '1px solid rgba(212,175,55,0.5)' : '1px solid transparent';
				row.style.opacity = isLocked ? '0.5' : '1';
				row.style.cursor = isLocked ? 'not-allowed' : 'pointer';
				
				const label = document.createElement('span');
				label.textContent = option.name;
				
				const requiredBadge = document.createElement('span');
				requiredBadge.textContent = isLocked ? `${option.required}% required` : '✓';
				requiredBadge.style.fontSize = '12px';
				requiredBadge.style.color = isLocked ? '#ff7e7e' : '#4CAF50';
				requiredBadge.style.padding = '2px 6px';
				requiredBadge.style.borderRadius = '10px';
				requiredBadge.style.background = isLocked ? 'rgba(255,0,0,0.1)' : 'rgba(76,175,80,0.1)';
				
				row.appendChild(label);
				row.appendChild(requiredBadge);
				
				if (!isLocked) {
					row.onclick = () => {
						// Update localStorage
						localStorage.setItem(storageKey, option.value);
						
						// Update UI
						optionsContainer.querySelectorAll('div').forEach(r => {
							r.style.background = 'transparent';
							r.style.border = '1px solid transparent';
						});
						row.style.background = 'rgba(212,175,55,0.2)';
						row.style.border = '1px solid rgba(212,175,55,0.5)';
						
						// Apply the effect
						if (typeof applyCallback === 'function') {
							applyCallback(option.value);
						}
					};
				}
				
				optionsContainer.appendChild(row);
			});
			
			section.appendChild(optionsContainer);
			return section;
		}
		
		// Apply background theme
		function applyBackgroundTheme(theme) {
			const body = document.body;
			const root = document.documentElement;
			body.setAttribute('data-theme', theme);
			
			switch (theme) {
				case 'professional':
					body.style.background = 'linear-gradient(-45deg, #2c3e50, #34495e, #2c3e50, #34495e)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 30s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#3498db');
					root.style.setProperty('--theme-secondary', '#2980b9');
					root.style.setProperty('--theme-accent', '#5dade2');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#ecf0f1');
					root.style.setProperty('--theme-text-muted', '#bdc3c7');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #3498db, #2980b9)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #3498db, #5dade2)');
					root.style.setProperty('--theme-card-bg', 'rgba(52, 152, 219, 0.15)');
					root.style.setProperty('--theme-border', 'rgba(52, 152, 219, 0.4)');
					break;
				case 'blue':
					body.style.background = 'linear-gradient(-45deg, #1a1d29, #0D47A1, #2d3748, #1565C0)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 20s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#64b5f6');
					root.style.setProperty('--theme-secondary', '#1565C0');
					root.style.setProperty('--theme-accent', '#90caf9');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#e8e8e8');
					root.style.setProperty('--theme-text-muted', '#bbbbbb');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #64b5f6, #1565C0)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #64b5f6, #90caf9)');
					root.style.setProperty('--theme-card-bg', 'rgba(100, 181, 246, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(100, 181, 246, 0.3)');
					break;
				case 'spacegold':
					body.style.background = 'var(--main-bg-gradient)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 20s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#c9a876');
					root.style.setProperty('--theme-secondary', '#b8932b');
					root.style.setProperty('--theme-accent', '#d4c5a9');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#e8e8e8');
					root.style.setProperty('--theme-text-muted', '#cccccc');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #c9a876, #b8932b, #a67c3a)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #c9a876, #d4c5a9)');
					root.style.setProperty('--theme-card-bg', 'rgba(201, 168, 118, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(201, 168, 118, 0.3)');
					break;
				case 'cyberpunk':
					body.style.background = 'linear-gradient(-45deg, #000000, #3a0647, #000000, #440a44)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 15s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#ff0080');
					root.style.setProperty('--theme-secondary', '#00ffff');
					root.style.setProperty('--theme-accent', '#ff00ff');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#e8e8e8');
					root.style.setProperty('--theme-text-muted', '#cccccc');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #ff0080, #00ffff)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #ff0080, #ff00ff)');
					root.style.setProperty('--theme-card-bg', 'rgba(255, 0, 128, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(255, 0, 128, 0.3)');
					break;
				case 'gold':
					body.style.background = 'linear-gradient(-45deg, #1a1700, #5c4500, #382a00, #aa8400)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 15s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#ffd700');
					root.style.setProperty('--theme-secondary', '#ffb347');
					root.style.setProperty('--theme-accent', '#fff8dc');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#e8e8e8');
					root.style.setProperty('--theme-text-muted', '#cccccc');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #ffd700, #ffb347)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #ffd700, #fff8dc)');
					root.style.setProperty('--theme-card-bg', 'rgba(255, 215, 0, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(255, 215, 0, 0.3)');
					break;
				case 'sunset':
					body.style.background = 'linear-gradient(-45deg, #ff7e5f, #feb47b, #ffb88c, #ff9966)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 25s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#ff6b35');
					root.style.setProperty('--theme-secondary', '#f7931e');
					root.style.setProperty('--theme-accent', '#ffb347');
					root.style.setProperty('--theme-text-primary', '#2c3e50');
					root.style.setProperty('--theme-text-secondary', '#34495e');
					root.style.setProperty('--theme-text-muted', '#5a6c7d');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #ff6b35, #f7931e)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #ff6b35, #ffb347)');
					root.style.setProperty('--theme-card-bg', 'rgba(255, 107, 53, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(255, 107, 53, 0.3)');
					break;
				case 'cosmic':
					body.style.background = 'linear-gradient(-45deg, #16122B, #1F2A44, #2C3E50, #1A1F3D)';
					body.style.backgroundSize = '400% 400%';
					body.style.animation = 'gradient 20s ease infinite';
					// Set theme variables
					root.style.setProperty('--theme-primary', '#9b59b6');
					root.style.setProperty('--theme-secondary', '#8e44ad');
					root.style.setProperty('--theme-accent', '#bb8fce');
					root.style.setProperty('--theme-text-primary', '#ffffff');
					root.style.setProperty('--theme-text-secondary', '#e8e8e8');
					root.style.setProperty('--theme-text-muted', '#cccccc');
					root.style.setProperty('--theme-gradient', 'linear-gradient(135deg, #9b59b6, #8e44ad)');
					root.style.setProperty('--theme-gradient-alt', 'linear-gradient(45deg, #9b59b6, #bb8fce)');
					root.style.setProperty('--theme-card-bg', 'rgba(155, 89, 182, 0.1)');
					root.style.setProperty('--theme-border', 'rgba(155, 89, 182, 0.3)');
					break;
			}
		}
		
		// Expose applyBackgroundTheme globally so it can be called from index.html
		window.applyBackgroundTheme = applyBackgroundTheme;
		
		// Apply particle effect
		function applyParticleEffect(effect) {
			if (typeof particlesJS !== 'function') return;
			
			let config = {};
			switch (effect) {
				case 'stars':
					config = {
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
					};
					break;
				case 'geometric':
					config = {
						particles: {
							number: { value: 30, density: { enable: true, value_area: 800 } },
							color: { value: ['#d4af37', '#ffffff', '#6c63ff'] },
							shape: { type: ["triangle", "edge", "polygon"], polygon: { nb_sides: 5 } },
							opacity: { value: 0.6, random: true },
							size: { value: 4, random: true },
							line_linked: { 
								enable: true, 
								distance: 150, 
								color: "#ffffff", 
								opacity: 0.2, 
								width: 1 
							},
							move: { 
								enable: true, 
								speed: 2, 
								direction: "none", 
								random: true,
								straight: false,
								out_mode: "bounce",
								bounce: true
							}
						}
					};
					break;
				case 'bubbles':
					config = {
						particles: {
							number: { value: 40, density: { enable: true, value_area: 800 } },
							color: { value: ['#3498db', '#9b59b6', '#1abc9c'] },
							shape: { type: "circle" },
							opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1 } },
							size: { value: 5, random: true, anim: { enable: true, speed: 2 } },
							line_linked: { enable: false },
							move: { 
								enable: true, 
								speed: 2, 
								direction: "top", 
								random: true,
								straight: false,
								out_mode: "out",
								bounce: false
							}
						}
					};
					break;
				case 'fireflies':
					config = {
						particles: {
							number: { value: 50, density: { enable: true, value_area: 1000 } },
							color: { value: ['#ffeb3b', '#ffc107', '#ff9800'] },
							shape: { type: "circle" },
							opacity: { value: 0.6, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1 } },
							size: { value: 3, random: true },
							line_linked: { enable: false },
							move: { 
								enable: true, 
								speed: 1.5, 
								direction: "none", 
								random: true,
								straight: false,
								out_mode: "out",
								bounce: false
							}
						}
					};
					break;
				case 'rain':
					config = {
						particles: {
							number: { value: 80, density: { enable: true, value_area: 800 } },
							color: { value: ['#00cc00', '#33cc33', '#00ff00'] },
							shape: { type: "char", character: { value: ["0", "1"] } },
							opacity: { value: 0.5, random: true },
							size: { value: 10, random: true },
							line_linked: { enable: false },
							move: { 
								enable: true, 
								speed: 8, 
								direction: "bottom", 
								random: false,
								straight: true,
								out_mode: "out",
								bounce: false
							}
						}
					};
					break;
			}
			
			particlesJS('particles-js', config);
		}
		
		// Apply character sticker
		function applyCharacterSticker(sticker) {
			const character = document.getElementById('floating-character');
			if (!character) return;
			
			// Remove any existing stickers first
			const existingStickers = character.querySelectorAll('.character-sticker');
			existingStickers.forEach(s => s.remove());
			
			if (sticker === 'none') return;
			
			const stickerElem = document.createElement('div');
			stickerElem.className = 'character-sticker';
			stickerElem.style.position = 'absolute';
			stickerElem.style.zIndex = '1001';
			
			switch (sticker) {
				case 'sunglasses':
					stickerElem.style.top = '30%';
					stickerElem.style.left = '25%';
					stickerElem.style.width = '70px';
					stickerElem.style.height = '25px';
					stickerElem.style.background = 'linear-gradient(to bottom, #000000 0%, #333333 100%)';
					stickerElem.style.borderRadius = '5px';
					stickerElem.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
					
					const leftLens = document.createElement('div');
					leftLens.style.position = 'absolute';
					leftLens.style.left = '5px';
					leftLens.style.top = '5px';
					leftLens.style.width = '25px';
					leftLens.style.height = '15px';
					leftLens.style.background = '#000';
					leftLens.style.borderRadius = '50%';
					leftLens.style.border = '1px solid #444';
					
					const rightLens = document.createElement('div');
					rightLens.style.position = 'absolute';
					rightLens.style.right = '5px';
					rightLens.style.top = '5px';
					rightLens.style.width = '25px';
					rightLens.style.height = '15px';
					rightLens.style.background = '#000';
					rightLens.style.borderRadius = '50%';
					rightLens.style.border = '1px solid #444';
					
					stickerElem.appendChild(leftLens);
					stickerElem.appendChild(rightLens);
					break;
					
				case 'devhat':
					stickerElem.style.top = '-20%';
					stickerElem.style.left = '20%';
					stickerElem.style.width = '70px';
					stickerElem.style.height = '40px';
					stickerElem.style.background = '#333';
					stickerElem.style.borderRadius = '5px 5px 0 0';
					
					const brim = document.createElement('div');
					brim.style.position = 'absolute';
					brim.style.bottom = '0';
					brim.style.left = '-10px';
					brim.style.width = '90px';
					brim.style.height = '10px';
					brim.style.background = '#222';
					brim.style.borderRadius = '2px';
					
					const logo = document.createElement('div');
					logo.style.position = 'absolute';
					logo.style.top = '10px';
					logo.style.left = '25px';
					logo.style.width = '20px';
					logo.style.height = '20px';
					logo.style.background = '#d4af37';
					logo.style.borderRadius = '50%';
					logo.style.display = 'flex';
					logo.style.alignItems = 'center';
					logo.style.justifyContent = 'center';
					logo.style.fontSize = '12px';
					logo.style.fontWeight = 'bold';
					logo.style.color = '#000';
					logo.textContent = '</>';
					
					stickerElem.appendChild(brim);
					stickerElem.appendChild(logo);
					break;
					
				case 'goldaura':
					stickerElem.style.top = '-10%';
					stickerElem.style.left = '-10%';
					stickerElem.style.width = '140px';
					stickerElem.style.height = '140px';
					stickerElem.style.background = 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, rgba(212,175,55,0) 70%)';
					stickerElem.style.borderRadius = '50%';
					stickerElem.style.animation = 'pulse 2s infinite';
					
					// Add pulse animation
					const styleEl = document.createElement('style');
					styleEl.textContent = `
						@keyframes pulse {
							0% { transform: scale(1); opacity: 0.6; }
							50% { transform: scale(1.1); opacity: 0.8; }
							100% { transform: scale(1); opacity: 0.6; }
						}
					`;
					document.head.appendChild(styleEl);
					break;
					
				case 'wings':
					stickerElem.style.top = '10%';
					stickerElem.style.left = '-50%';
					stickerElem.style.width = '80px';
					stickerElem.style.height = '100px';
					
					// Left wing
					const leftWing = document.createElement('div');
					leftWing.style.position = 'absolute';
					leftWing.style.left = '0';
					leftWing.style.top = '0';
					leftWing.style.width = '100%';
					leftWing.style.height = '100%';
					leftWing.style.backgroundImage = 'linear-gradient(to right, rgba(108,99,255,0.8), rgba(108,99,255,0.2))';
					leftWing.style.clipPath = 'polygon(0 50%, 100% 0, 100% 100%)';
					leftWing.style.animation = 'wingFlap 2s infinite';
					
					// Right wing
					const rightWing = document.createElement('div');
					rightWing.style.position = 'absolute';
					rightWing.style.right = '-80px';
					rightWing.style.top = '0';
					rightWing.style.width = '80px';
					rightWing.style.height = '100px';
					rightWing.style.backgroundImage = 'linear-gradient(to left, rgba(108,99,255,0.8), rgba(108,99,255,0.2))';
					rightWing.style.clipPath = 'polygon(0 0, 100% 50%, 0 100%)';
					rightWing.style.animation = 'wingFlap 2s infinite reverse';
					
					// Add wing animation
					const wingStyle = document.createElement('style');
					wingStyle.textContent = `
						@keyframes wingFlap {
							0% { transform: rotateY(0deg); }
							50% { transform: rotateY(60deg); }
							100% { transform: rotateY(0deg); }
						}
					`;
					document.head.appendChild(wingStyle);
					
					stickerElem.appendChild(leftWing);
					stickerElem.appendChild(rightWing);
					break;
			}
			
			character.appendChild(stickerElem);
		}
		
		// Apply clock style
		function applyClockStyle(style) {
			// Remove any existing clock
			const existingClock = document.getElementById('custom-clock');
			if (existingClock) existingClock.remove();
			
			if (style === 'none') return;
			
			const clock = document.createElement('div');
			clock.id = 'custom-clock';
			Object.assign(clock.style, {
				position: 'fixed',
				top: '20px',
				right: '20px',
				padding: '10px 15px',
				borderRadius: '10px',
				fontFamily: 'monospace',
				fontSize: '14px',
				fontWeight: 'bold',
				zIndex: '9999',
				backdropFilter: 'blur(5px)',
				boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
				transition: 'all 0.3s ease'
			});
			
			switch (style) {
				case 'digital':
					Object.assign(clock.style, {
						background: 'rgba(0,0,0,0.7)',
						color: '#d4af37',
						border: '1px solid #d4af37'
					});
					
					// Update time function
					function updateDigitalClock() {
						const now = new Date();
						const hours = now.getHours().toString().padStart(2, '0');
						const minutes = now.getMinutes().toString().padStart(2, '0');
						const seconds = now.getSeconds().toString().padStart(2, '0');
						clock.textContent = `${hours}:${minutes}:${seconds}`;
					}
					
					updateDigitalClock();
					setInterval(updateDigitalClock, 1000);
					break;
					
				case 'analog':
					Object.assign(clock.style, {
						width: '80px',
						height: '80px',
						padding: '0',
						background: 'rgba(30,33,48,0.8)',
						border: '2px solid #d4af37',
						borderRadius: '50%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					});
					
					// Clock face
					const face = document.createElement('div');
					Object.assign(face.style, {
						width: '70px',
						height: '70px',
						background: '#1e2130',
						borderRadius: '50%',
						position: 'relative'
					});
					
					// Clock center
					const center = document.createElement('div');
					Object.assign(center.style, {
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '6px',
						height: '6px',
						background: '#d4af37',
						borderRadius: '50%',
						transform: 'translate(-50%, -50%)',
						zIndex: '3'
					});
					
					// Hour hand
					const hourHand = document.createElement('div');
					hourHand.className = 'hour-hand';
					Object.assign(hourHand.style, {
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '20px',
						height: '2px',
						background: '#fff',
						borderRadius: '2px',
						transformOrigin: 'left center'
					});
					
					// Minute hand
					const minuteHand = document.createElement('div');
					minuteHand.className = 'minute-hand';
					Object.assign(minuteHand.style, {
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '28px',
						height: '2px',
						background: '#6c63ff',
						borderRadius: '2px',
						transformOrigin: 'left center'
					});
					
					// Second hand
					const secondHand = document.createElement('div');
					secondHand.className = 'second-hand';
					Object.assign(secondHand.style, {
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '30px',
						height: '1px',
						background: '#d4af37',
						transformOrigin: 'left center',
						zIndex: '2'
					});
					
					face.appendChild(hourHand);
					face.appendChild(minuteHand);
					face.appendChild(secondHand);
					face.appendChild(center);
					clock.appendChild(face);
					
					// Update analog clock
					function updateAnalogClock() {
						const now = new Date();
						const hours = now.getHours() % 12;
						const minutes = now.getMinutes();
						const seconds = now.getSeconds();
						
						const hourDeg = (hours * 30) + (minutes * 0.5);
						const minuteDeg = minutes * 6;
						const secondDeg = seconds * 6;
						
						hourHand.style.transform = `translate(-2px, -50%) rotate(${hourDeg}deg)`;
						minuteHand.style.transform = `translate(-2px, -50%) rotate(${minuteDeg}deg)`;
						secondHand.style.transform = `translate(-2px, -50%) rotate(${secondDeg}deg)`;
					}
					
					updateAnalogClock();
					setInterval(updateAnalogClock, 1000);
					break;
					
				case 'weather':
					Object.assign(clock.style, {
						background: 'rgba(30,33,48,0.8)',
						color: '#fff',
						border: '1px solid #6c63ff',
						textAlign: 'center',
						width: '120px'
					});
					
					// Add weather icon and temp
					clock.innerHTML = `
						<div style="margin-bottom:5px;">
							<span id="clock-time">00:00</span>
						</div>
						<div style="display:flex;align-items:center;justify-content:center;gap:5px;">
							<span id="weather-icon">☀️</span>
							<span id="weather-temp">72°F</span>
						</div>
					`;
					
					// Update weather clock
					function updateWeatherClock() {
						const now = new Date();
						const hours = now.getHours().toString().padStart(2, '0');
						const minutes = now.getMinutes().toString().padStart(2, '0');
						
						// Random weather simulation
						const timeElement = document.getElementById('clock-time');
						const iconElement = document.getElementById('weather-icon');
						const tempElement = document.getElementById('weather-temp');
						
						if (timeElement) timeElement.textContent = `${hours}:${minutes}`;
						
						// Change weather based on time of day
						if (iconElement && tempElement) {
							const hour = now.getHours();
							if (hour >= 6 && hour < 10) {
								iconElement.textContent = '🌅'; // Sunrise
								tempElement.textContent = `${Math.floor(60 + Math.random() * 5)}°F`;
							} else if (hour >= 10 && hour < 16) {
								iconElement.textContent = '☀️'; // Sunny
								tempElement.textContent = `${Math.floor(70 + Math.random() * 10)}°F`;
							} else if (hour >= 16 && hour < 19) {
								iconElement.textContent = '🌆'; // Sunset
								tempElement.textContent = `${Math.floor(65 + Math.random() * 5)}°F`;
							} else {
								iconElement.textContent = '🌙'; // Night
								tempElement.textContent = `${Math.floor(55 + Math.random() * 5)}°F`;
							}
						}
					}
					
					updateWeatherClock();
					setInterval(updateWeatherClock, 60000); // Update every minute
					break;
					
				case 'daynight':
					Object.assign(clock.style, {
						background: 'rgba(30,33,48,0.8)',
						border: '1px solid #d4af37',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						padding: '12px'
					});
					
					// Add time and progress bar
					clock.innerHTML = `
						<div style="margin-bottom:5px;color:#fff;font-size:16px;" id="daynight-time">00:00</div>
						<div style="width:100px;height:10px;background:rgba(0,0,0,0.3);border-radius:5px;overflow:hidden;position:relative;">
							<div id="daynight-progress" style="height:100%;width:0%;position:absolute;transition:all 1s linear;"></div>
							<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:space-between;padding:0 2px;">
								<span style="font-size:7px;color:#fff;">🌅</span>
								<span style="font-size:7px;color:#fff;">☀️</span>
								<span style="font-size:7px;color:#fff;">🌙</span>
							</div>
						</div>
						<div style="margin-top:5px;font-size:12px;color:#d4af37;" id="daynight-period">Morning</div>
					`;
					
					// Update day/night clock
					function updateDayNightClock() {
						const now = new Date();
						const hours = now.getHours().toString().padStart(2, '0');
						const minutes = now.getMinutes().toString().padStart(2, '0');
						const seconds = now.getSeconds();
						
						const timeElement = document.getElementById('daynight-time');
						const progressElement = document.getElementById('daynight-progress');
						const periodElement = document.getElementById('daynight-period');
						
						if (timeElement) timeElement.textContent = `${hours}:${minutes}`;
						
						if (progressElement) {
							// Calculate progress through the day
							const dayProgress = ((now.getHours() * 3600) + (now.getMinutes() * 60) + seconds) / 86400 * 100;
							progressElement.style.width = `${dayProgress}%`;
							
							// Color based on time of day
							const hour = now.getHours();
							if (hour >= 5 && hour < 12) {
								// Morning
								progressElement.style.background = 'linear-gradient(to right, #ff9a00, #ffcc00)';
								if (periodElement) periodElement.textContent = 'Morning';
							} else if (hour >= 12 && hour < 17) {
								// Afternoon
								progressElement.style.background = 'linear-gradient(to right, #ffcc00, #ff4500)';
								if (periodElement) periodElement.textContent = 'Afternoon';
							} else if (hour >= 17 && hour < 20) {
								// Evening
								progressElement.style.background = 'linear-gradient(to right, #ff4500, #1e2130)';
								if (periodElement) periodElement.textContent = 'Evening';
							} else {
								// Night
								progressElement.style.background = 'linear-gradient(to right, #1e2130, #0d253f)';
								if (periodElement) periodElement.textContent = 'Night';
							}
						}
					}
					
					updateDayNightClock();
					setInterval(updateDayNightClock, 1000);
					break;
			}
			
			document.body.appendChild(clock);
		}

		function implementArcadeControls() {
			// Check if controls exist and toggle them if they do
			if (document.getElementById('arcade-controls')) {
				const controls = document.getElementById('arcade-controls');
				controls.style.display = (controls.style.display === 'none' || controls.style.display === '') ? 'flex' : 'none';
				return;
			}
			
			// Create controls if they don't exist
			const controls = document.createElement('div');
			controls.id = 'arcade-controls';
			controls.style.position = 'fixed';
			controls.style.bottom = '20px';
			controls.style.left = '50%';
			controls.style.transform = 'translateX(-50%)';
			controls.style.display = 'flex';
			controls.style.gap = '10px';
			controls.style.padding = '10px';
			controls.style.background = 'rgba(0,0,0,0.7)';
			controls.style.borderRadius = '10px';
			controls.style.zIndex = '10001';

			const mkBtn = (k, label, extra = {}) => {
				const b = document.createElement('button');
				b.textContent = label;
				b.className = 'arcade-button';
				b.dataset.key = k;
				Object.assign(b.style, { width: '42px', height: '42px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px' });
				Object.assign(b.style, extra);
				b.addEventListener('click', function() {
					const event = new KeyboardEvent('keydown', {
						key: k,
						code: k,
						bubbles: true
					});
					document.dispatchEvent(event);
				});
				return b;
			};

			const dpad = document.createElement('div');
			dpad.style.display = 'grid';
			dpad.style.gridTemplateColumns = 'repeat(3,42px)';
			dpad.style.gridTemplateRows = 'repeat(3,42px)';
			for (let i = 0; i < 9; i++) {
				let cell = document.createElement('div');
				cell.style.width = '42px'; cell.style.height = '42px';
				if (i === 1) cell = mkBtn('ArrowUp', '⬆️');
				if (i === 3) cell = mkBtn('ArrowLeft', '⬅️');
				if (i === 5) cell = mkBtn('ArrowRight', '➡️');
				if (i === 7) cell = mkBtn('ArrowDown', '⬇️');
				dpad.appendChild(cell);
			}

			const actions = document.createElement('div');
			actions.style.display = 'flex';
			actions.style.gap = '10px';
			actions.appendChild(mkBtn('b', 'B', { background: '#00a' }));
			actions.appendChild(mkBtn('a', 'A', { background: '#a00' }));
			const start = mkBtn('Enter', 'Start', { width: '80px' });
			actions.appendChild(start);

			const close = document.createElement('button');
			close.textContent = '✖';
			Object.assign(close.style, { position: 'absolute', top: '-10px', right: '-10px', width: '26px', height: '26px', borderRadius: '50%', background: '#f00', color: '#fff', border: 'none' });
			close.onclick = () => { controls.style.display = 'none'; };

			controls.appendChild(dpad);
			controls.appendChild(actions);
			controls.appendChild(close);
			document.body.appendChild(controls);
		}

		function showArcadePanel() {
			const existing = document.getElementById('arcade-panel');
			if (existing) existing.remove();
			const panel = document.createElement('div');
			panel.id = 'arcade-panel';
			Object.assign(panel.style, {
				position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(600px, 90vw)', maxHeight: '80vh', overflowY: 'auto',
				background: 'rgba(30,33,48,0.95)', border: '2px solid #d4af37', borderRadius: '12px', padding: '18px', color: '#fff', zIndex: 10002,
				boxShadow: '0 0 25px rgba(0,0,0,0.7)'
			});
			const h2 = document.createElement('h2'); h2.textContent = 'ARCADE MODE'; h2.style.color = '#d4af37'; h2.style.textAlign = 'center'; h2.style.textShadow = '0 0 5px rgba(212,175,55,0.3)'; panel.appendChild(h2);
			const level = parseInt(localStorage.getItem('friendshipLevel') || '0');
			
			// Friendship level display
			const wrap = document.createElement('div'); wrap.style.textAlign = 'center';
			const title = document.createElement('div'); title.textContent = 'Current Friendship Level:'; title.style.marginBottom = '6px'; wrap.appendChild(title);
			const barC = document.createElement('div'); Object.assign(barC.style, { width: '100%', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', border: '1px solid rgba(212,175,55,0.3)' });
			const bar = document.createElement('div'); bar.style.height = '100%'; bar.style.width = level + '%';
			bar.style.background = level < 30 ? 'linear-gradient(to right, #ff4e4e, #ff7e7e)' : level < 70 ? 'linear-gradient(to right, #ffc107, #ffeb3b)' : 'linear-gradient(to right, #4caf50, #8bc34a)';
			barC.appendChild(bar); wrap.appendChild(barC);
			const value = document.createElement('div'); value.textContent = level + '%'; wrap.appendChild(value); panel.appendChild(wrap);
			
			// Konami code display
			const konami = ['⬆️','⬆️','⬇️','⬇️','⬅️','➡️','⬅️','➡️','🅱️','🅰️','▶️'];
			const unlocked = parseInt(localStorage.getItem('unlockedKonamiPieces') || '0');
			const codeRow = document.createElement('div'); 
			Object.assign(codeRow.style, { 
				display: 'flex', 
				gap: '8px', 
				justifyContent: 'center', 
				margin: '10px 0',
				flexWrap: 'wrap'
			});
			
			for (let i = 0; i < konami.length; i++) {
				const cell = document.createElement('div'); 
				Object.assign(cell.style, { 
					width: '30px', 
					height: '30px', 
					display: 'flex', 
					alignItems: 'center', 
					justifyContent: 'center', 
					borderRadius: '4px', 
					border: '1px solid rgba(212,175,55,0.2)',
					margin: '2px'
				});
				
				if (i < unlocked) { 
					cell.textContent = konami[i]; 
					cell.style.background = 'rgba(212,175,55,0.25)'; 
					cell.style.borderColor = '#d4af37';
					cell.style.color = '#fff';
				} else { 
					cell.textContent = '?'; 
					cell.style.background = 'rgba(0,0,0,0.3)';
					cell.style.color = '#888'; 
				}
				codeRow.appendChild(cell);
			}
			panel.appendChild(codeRow);
			const hint = document.createElement('div'); hint.style.textAlign = 'center'; hint.style.fontSize = '12px';
			hint.textContent = unlocked < konami.length ? 'Increase friendship to unlock more of the secret code.' : 'Full Konami Code unlocked!';
			panel.appendChild(hint);
			
			// Mini-games section
			const gamesTitle = document.createElement('h3'); 
			gamesTitle.textContent = 'MINI GAMES'; 
			gamesTitle.style.color = '#d4af37'; 
			gamesTitle.style.textAlign = 'center'; 
			gamesTitle.style.marginTop = '20px';
			gamesTitle.style.borderBottom = '1px solid rgba(212,175,55,0.3)';
			gamesTitle.style.paddingBottom = '5px';
			panel.appendChild(gamesTitle);
			
			const gamesContainer = document.createElement('div');
			gamesContainer.style.display = 'flex';
			gamesContainer.style.justifyContent = 'center';
			gamesContainer.style.gap = '10px';
			gamesContainer.style.marginTop = '15px';
			gamesContainer.style.flexWrap = 'wrap';
			
			// Create game buttons
			const createGameButton = (name, icon, gameType) => {
				const btn = document.createElement('button');
				btn.className = 'game-button';
				btn.innerHTML = `${icon}<br>${name}`;
				Object.assign(btn.style, {
					padding: '10px', 
					minWidth: '120px',
					background: 'linear-gradient(135deg, #1e2130, #2a2e3d)', 
					color: '#d4af37', 
					border: '1px solid #d4af37', 
					borderRadius: '8px', 
					cursor: 'pointer',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '14px',
					transition: 'all 0.3s ease'
				});
				
				btn.onmouseover = () => {
					btn.style.background = 'linear-gradient(135deg, #2a2e3d, #353a4d)';
					btn.style.boxShadow = '0 0 10px rgba(212,175,55,0.5)';
				};
				btn.onmouseout = () => {
					btn.style.background = 'linear-gradient(135deg, #1e2130, #2a2e3d)';
					btn.style.boxShadow = 'none';
				};
				
				btn.onclick = () => {
					panel.remove();
					setTimeout(() => {
						if (typeof window.ArcadeGames?.initializeGame === 'function') {
							window.ArcadeGames.initializeGame(gameType);
						} else {
							speechText.textContent = "Games are loading. Please try again in a moment.";
						}
					}, 300);
				};
				
				return btn;
			};
			
			// Add game buttons
			gamesContainer.appendChild(createGameButton('Hangman', '🎯', 'hangman'));
			gamesContainer.appendChild(createGameButton('Number Guess', '🔢', 'number-guess'));
			gamesContainer.appendChild(createGameButton('Tech Quiz', '❓', 'quiz'));
			gamesContainer.appendChild(createGameButton('Snake', '🐍', 'snake'));
			gamesContainer.appendChild(createGameButton('Pong', '🏓', 'pong'));
			
			panel.appendChild(gamesContainer);
			
			// Controls button
			const btn = document.createElement('button'); 
			btn.textContent = 'Show Arcade Controls'; 
			Object.assign(btn.style, { 
				display: 'block', 
				margin: '18px auto 12px', 
				padding: '10px', 
				background: 'linear-gradient(90deg, #1e2130, #2a2e3d, #1e2130)', 
				color: '#d4af37', 
				border: '1px solid #d4af37', 
				borderRadius: '6px', 
				cursor: 'pointer' 
			});
			btn.onmouseover = () => { btn.style.background = 'linear-gradient(90deg, #2a2e3d, #353a4d, #2a2e3d)'; };
			btn.onmouseout = () => { btn.style.background = 'linear-gradient(90deg, #1e2130, #2a2e3d, #1e2130)'; };
			btn.onclick = () => { 
				panel.remove(); 
				implementArcadeControls(); 
				increaseFriendship(5); 
			};
			panel.appendChild(btn);
			
			// Close button
			const close = document.createElement('button'); 
			close.textContent = 'Close'; 
			Object.assign(close.style, { 
				display: 'block', 
				margin: '6px auto', 
				padding: '8px 12px', 
				background: 'rgba(100,100,100,0.3)', 
				color: '#fff', 
				border: 'none', 
				borderRadius: '6px', 
				cursor: 'pointer' 
			});
			close.onclick = () => panel.remove(); 
			panel.appendChild(close);
			
			document.body.appendChild(panel);
		}

		// 4) VishwaBot with personality and dad jokes
		class VishwaBot {
			constructor() { this.botVisible = true; this.rejectionCount = 0; }
			analyzeMessage(t) {
				const x=t.toLowerCase();
				if (x.includes('hide')||x.includes('go away')) return 'hide_request';
				if (x.includes('show')||x.includes('help')||x.includes('vishwa')||x.includes('bot')) return 'show_request';
				if (/(no|nope|not interested|stop|boring|meh)/.test(x)) return 'rejection';
				if (/(hi|hello|hey)\b/.test(x)) return 'greetings';
				if (/(project|work|built)/.test(x)) return 'projects';
				if (/(skill|tech|programming)/.test(x)) return 'skills';
				if (/(school|college|university)/.test(x)) return 'school';
				if (/(contact|email|reach|hire)/.test(x)) return 'contact';
				if (/(certificate|certification|credential)/.test(x)) return 'certificates';
				if (/(game|play|arcade|hangman|quiz|number.*guess)/.test(x)) return 'games';
				if (/(joke|funny|laugh|humor)/.test(x)) return 'joke_request';
				if (/(music|song|listen|artist|band)/.test(x)) return 'music';
				if (/(hobby|hobbies|free time|interest|passion)/.test(x)) return 'hobbies';
				if (/(who are you|what are you|about you|tell me about|your name)/.test(x)) return 'identity';
				if (/(yes|yep|yeah|sure|okay|ok|sounds good|alright)/.test(x)) return 'affirmative';
				if (/(fun|cool|awesome|nice|great)/.test(x)) return 'positive';
				if (/(sad|unhappy|depressed|feeling down)/.test(x)) return 'sympathy';
				if (/(thank|thanks|appreciate|grateful)/.test(x)) return 'gratitude';
				return 'unknown';
			}
			async getDadJoke(){
				try{ const r=await fetch('https://official-joke-api.appspot.com/random_joke'); const j=await r.json(); return `${j.setup} ... ${j.punchline} 😄`; }
				catch{ return this.getBackupJoke(); }
			}
			getBackupJoke(){
				const jokes=[
					'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
					"How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
					"Why do Java developers wear glasses? Because they can't C#! 👓",
					"What's a programmer's favorite hangout place? The Foo Bar! 🍺",
					"Why did the developer go broke? Because he used up all his cache! 💸",
					"Why don't programmers like nature? It has too many bugs and no debugging tool! 🐞",
					"Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings! 😢",
					"What's a computer's favorite snack? Microchips! 🍪",
					"How do you comfort a JavaScript bug? You console it! 🖥️",
					"Why did the function go to therapy? It had too many nested issues to work through! 🧠"
				];
				return jokes[Math.floor(Math.random()*jokes.length)];
			}
			async getChatResponse(msg){
				const cat=this.analyzeMessage(msg);
				switch(cat){
					case 'hide_request': this.botVisible=false; return "Okay, I'll hide! Say 'show vishwa' to bring me back!";
					case 'show_request': this.botVisible=true; this.rejectionCount=0; return "I'm back! Ask me about my projects or skills.";
					case 'rejection': this.rejectionCount++; return this.rejectionCount>=2 ? (await this.getDadJoke()) : 'Alright—how about a quick joke or a fun fact?';
					case 'greetings': return "Hey there! 👋 I'm your interactive portfolio guide. Try asking about my projects, skills, or hobbies. You can also say 'take me to projects' or 'play games' to have some fun!";
					case 'projects': return "I've built 3D web experiences with Three.js, AI-powered recommendation systems, and interactive websites. Want to see them? Say 'take me to projects' and I'll show you!";
					case 'skills': return "My technical stack includes Python, JavaScript, React, Three.js, MySQL, and AI/ML frameworks. I'm also skilled in UI/UX design and creating interactive web experiences. Anything specific you'd like to know?";
					case 'school': return "I'm studying Computer Science at Texas Tech University with a 4.0 GPA. I'm active in the Google Developer Student Club and CodePath, where I mentor other students in web development.";
					case 'contact': return "You can reach me at vishwa.belaganti@gmail.com. I'm also on LinkedIn and GitHub - say 'take me to resume' if you'd like to see my full contact details!";
					case 'certificates': return "I've earned certifications in Google Cybersecurity, Python Programming, MySQL Database Administration, and Figma UI/UX Design. Say 'take me to certificates' to see them all!";
					case 'games': return "I've created several fun games for you to enjoy! Say 'arcade' to see all games, or try 'play hangman', 'play number guess', or 'play quiz' to start playing right away. Each game increases our friendship level!";
					case 'joke_request': return await this.getDadJoke();
					case 'music': return "I'm into a diverse music selection! I love pop and soul music, especially Stephan Sanchez. I also enjoy lofi beats for coding sessions and ambient rain sounds when I need to focus or relax. What kind of music do you enjoy?";
					case 'hobbies': return "When I'm not coding, I love playing soccer and hitting the gym. I'm also passionate about art and creating digital illustrations. I enjoy listening to music and trying out new dessert recipes - baking is my stress reliever!";
					case 'identity': return "I'm Vishwa's interactive portfolio assistant! I'm here to help you explore projects, skills, and learn more about Vishwa. You can ask me about technical skills, education, or we can just chat and play some games together!";
					case 'affirmative': return "Great! Is there anything specific you'd like to know about my projects or skills? Or would you prefer to play a game? The arcade has several fun options!";
					case 'positive': return "Thanks for the positive vibes! 😊 I try to keep things fun and engaging. Want to check out my projects or maybe play a quick game to see more interactive elements?";
					case 'sympathy': return "I'm sorry to hear that. How about a quick game or a joke to brighten your day? Or we could look at some cool projects I've built - visual design always cheers me up!";
					case 'gratitude': return "You're very welcome! I'm happy to help and chat anytime. Is there anything else you'd like to know or explore?";
					default: return "I'm not sure I understood that. You can ask about my projects, skills, hobbies, or music taste. Try 'help' for more options or 'arcade' to play games and increase our friendship level!";
				}
			}
		}

		// 5) Navigation helpers inside handleChatInput
		async function routeChat(input){
			const t=input.toLowerCase().trim();
			
			// Navigation routes
			if (/take me to|go to|navigate/.test(t)){
				if (t.includes('project')) { setTimeout(()=>location.href='projects.html', 400); return 'Opening Projects…'; }
				if (t.includes('certificate')) { setTimeout(()=>location.href='certificates.html', 400); return 'Opening Certificates…'; }
				if (t.includes('resume')) { setTimeout(()=>window.open('files/Vishwa_Belaganti_Resume 2025.pdf','_blank'), 400); return 'Opening Resume…'; }
				if (t.includes('home') || t.includes('main')) { setTimeout(()=>location.href='index.html', 400); return 'Going to Home page…'; }
			}
			
			// Arcade panel and friendship
			if (t.includes('arcade')) { 
				showArcadePanel(); 
				return 'Arcade panel opened! Here you can play games to increase our friendship level. Each game gives you points - collect enough to unlock special themes and effects!'; 
			}
			if (t.includes('friendship')) { 
				addFriendshipBarToChatbox(); 
				return 'Friendship bar added above. Keep chatting and playing games to level up! Higher friendship levels unlock cool customization options for the interface.'; 
			}
			
			// Handle jokes differently - if a user responded to a joke prompt
			if (/(yes|yeah|sure|ok|okay).*(joke|funny)/.test(t) || 
				(/(tell|another|more).*(joke|jokes)/.test(t))) {
				const joke = await bot.getDadJoke();
				return joke;
			}
			
			// Direct game launches with improved responses
			if (/play.*hangman|start.*hangman|hangman.*game/.test(t)) { 
				if (typeof window.ArcadeGames?.initializeGame === 'function') {
					setTimeout(() => window.ArcadeGames.initializeGame('hangman'), 300); 
					return 'Starting Hangman game... Try to guess the programming-related word before the stick figure is complete! This will also increase our friendship level.'; 
				}
			}
			if (/play.*number|guess.*number|number.*game|number.*guess/.test(t)) { 
				if (typeof window.ArcadeGames?.initializeGame === 'function') {
					setTimeout(() => window.ArcadeGames.initializeGame('number-guess'), 300); 
					return 'Starting Number Guessing game... I\'m thinking of a number between 1 and 100. Try to guess it in as few attempts as possible!'; 
				}
			}
			if (/play.*quiz|start.*quiz|quiz.*game/.test(t)) { 
				if (typeof window.ArcadeGames?.initializeGame === 'function') {
					setTimeout(() => window.ArcadeGames.initializeGame('quiz'), 300); 
					return 'Starting Tech Quiz game... Test your knowledge about programming, tech companies, and computer science. Each correct answer increases friendship!'; 
				}
			}
			if (/play|game|games/.test(t)) { 
				showArcadePanel(); 
				return 'Here are all the games in the arcade! Each game increases our friendship level, which unlocks new customization options. What would you like to play?'; 
			}
			
			// If no special routing needed, return null so the regular chat flow continues
			
			// Special help command with detailed instructions
			if (/help|guide|tutorial|how.*work|what.*do/.test(t)) {
				return `
📚 <b>PORTFOLIO ASSISTANT GUIDE</b> 📚

I'm Vishwa's interactive portfolio assistant, designed to help you explore this website and learn about Vishwa's skills, projects, and background.

<b>🔍 NAVIGATION COMMANDS:</b>
• "Take me to projects" - Navigate to the projects page
• "Take me to certificates" - View certifications and achievements
• "Take me to resume" - Open Vishwa's resume in a new tab
• "Take me to home" - Return to the main page

<b>🎮 GAMES & ARCADE:</b>
• "Arcade" - Open the games panel with all available games
• "Play hangman" - Start a programming-themed hangman game
• "Play number guess" - Try to guess a number between 1-100
• "Play quiz" - Test your knowledge with a tech trivia quiz
• "Show arcade controls" - Display on-screen controls for games

<b>🤝 FRIENDSHIP SYSTEM:</b>
• "Show friendship" - Display your current friendship level
• Chat and play games to increase friendship
• Higher friendship levels unlock UI customization options
• Unlock themes, particle effects, avatar accessories, and clock styles

<b>❓ INFORMATION TOPICS:</b>
• "Projects" - Learn about Vishwa's development projects
• "Skills" - Discover technical skills and expertise
• "School" - Information about education and academic achievements
• "Contact" - How to get in touch with Vishwa
• "Certificates" - View professional certifications
• "Music" - Learn about Vishwa's music preferences
• "Hobbies" - Discover interests outside of programming

<b>😄 FUN INTERACTIONS:</b>
• "Tell me a joke" - Hear a programming or tech-related joke
• Look for the Konami Code sequence for a special surprise!
• Try up-up-down-down-left-right-left-right B-A-Start

Type any question or use these commands to explore the portfolio!
`;
			}
			
			return null;
		}

		// 6) Wire up chat input to VishwaBot
		const chatInput = document.getElementById('chatInput');
		const chatSend = document.getElementById('chatSend');
		
		// Create VishwaBot instance and expose it globally for page scripts
		const bot = new VishwaBot();
		window.vishwaBot = bot;
		
		// Create the chat handler function
		async function sendChat(){
			const val = chatInput.value.trim(); 
			if (!val) return;
			
			// Show user's message
			speechText.textContent = `You: ${val}`;
			chatInput.value = '';
			
			// Increase friendship with each message
			increaseFriendship(1);
			
			// Process message after a small delay
			setTimeout(async () => {
				try {
					// First check for navigation or special commands
					const routed = await routeChat(val);
					if (routed){ 
						speechText.textContent = routed; 
						return; 
					}
					
					// If no special command, get a response from VishwaBot
					const reply = await bot.getChatResponse(val);
					speechText.textContent = reply || '…';
				} catch (err) {
					console.error('Error processing chat:', err);
					speechText.textContent = "Sorry, I had trouble processing that. Please try again!";
				}
			}, 500);
		}
		if (chatSend) chatSend.addEventListener('click', sendChat);
		if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key==='Enter') sendChat(); });

		// 7) Expose globals expected by page scripts and games
		window.addFriendshipBarToChatbox = addFriendshipBarToChatbox;
		window.increaseFriendship = increaseFriendship;
		window.resetFriendship = resetFriendship;
		window.showArcadePanel = showArcadePanel;
		window.implementArcadeControls = implementArcadeControls;

		// 8) Add event handlers for character clicking
		const character = document.getElementById('floating-character');
		if (character) {
			// Clear any existing event handlers
			character.onclick = null;
			character.ondblclick = null;
			
			// Toggle chat on single click
			character.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				console.log('Character clicked');
				
				// Show speech bubble
				if (speech) {
					speech.classList.add('show');
					speech.style.opacity = '1';
					speech.style.visibility = 'visible';
				}
				
				// Toggle chatContainer visibility
				const chatContainer = document.getElementById('chatContainer');
				if (chatContainer) {
					chatContainer.style.display = 'flex';
					
					// Focus the input
					const chatInput = document.getElementById('chatInput');
					if (chatInput) {
						setTimeout(() => chatInput.focus(), 300);
					}
				}
				
				// Update speech text
				if (speechText) {
					speechText.textContent = "Hey there! How can I help you?";
				}
				
				// Animate character
				if (typeof gsap !== 'undefined') {
					gsap.to(character, { 
						rotation: 5, 
						scale: 1.15, 
						duration: 0.3,
						ease: "power2.out",
						onComplete: () => {
							gsap.to(character, { 
								rotation: 0, 
								scale: 1, 
								duration: 0.5,
								ease: "elastic.out(1, 0.3)" 
							});
						}
					});
				}
			});
			
			// Hide/Show bot on double click with toggle
			let isCharacterHidden = false;
			character.addEventListener('dblclick', (e) => {
				e.preventDefault();
				e.stopPropagation();
				console.log('Character double-clicked');
				
				if (!isCharacterHidden) {
					// Hide character
					isCharacterHidden = true;
					
					// Hide speech
					if (speech) {
						speech.style.opacity = '0';
						speech.style.visibility = 'hidden';
					}
					
					// Animate character hiding
					if (typeof gsap !== 'undefined') {
						gsap.to(character, {
							opacity: 0.3,
							scale: 0.7,
							duration: 0.3,
							ease: "power2.out"
						});
					} else {
						character.style.opacity = '0.3';
						character.style.transform = 'scale(0.7)';
					}
					
					// Hide chat container
					const chatContainer = document.getElementById('chatContainer');
					if (chatContainer) {
						chatContainer.style.display = 'none';
					}
					
					console.log('Character hidden');
				} else {
					// Show character
					isCharacterHidden = false;
					
					// Show speech
					if (speech) {
						speech.style.opacity = '1';
						speech.style.visibility = 'visible';
					}
					
					// Animate character showing
					if (typeof gsap !== 'undefined') {
						gsap.to(character, {
							opacity: 1,
							scale: 1,
							duration: 0.3,
							ease: "power2.out"
						});
					} else {
						character.style.opacity = '1';
						character.style.transform = 'scale(1)';
					}
					
					console.log('Character shown');
				}
			});
			
			// Handle keypress
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape') {
					// Hide speech
					if (speech) {
						speech.style.opacity = '0';
						speech.style.visibility = 'hidden';
					}
					
					// Hide chat container
					const chatContainer = document.getElementById('chatContainer');
					if (chatContainer) {
						chatContainer.style.display = 'none';
					}
				}
			});
		} else {
			// Create floating character if it doesn't exist
			const newCharacter = document.createElement('div');
			newCharacter.id = 'floating-character';
			newCharacter.style.cssText = 'position:fixed; bottom:20px; right:20px; width:140px; height:140px; cursor:pointer; z-index:10000; transition: all 0.3s ease;';
			const img = document.createElement('img');
			img.src = 'images/profile.png';
			img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:50%; border:3px solid #d4af37; box-shadow:0 4px 12px rgba(0,0,0,0.4);';
			newCharacter.appendChild(img);
			document.body.appendChild(newCharacter);
			
			// Add click event to show speech bubble
			newCharacter.addEventListener('click', () => {
				if (speech) {
					speech.classList.add('show');
					speech.style.opacity = '1';
					speech.style.visibility = 'visible';
				}
				if (chatContainer) {
					chatContainer.style.display = 'flex';
				}
				if (speechText) {
					speechText.textContent = "Hey there! How can I help you?";
				}
			});
		}
		
		// 9) Show initial bubble with welcome text and bar
		speech.classList.add('show');
		speech.style.opacity = '1';
		speech.style.visibility = 'visible';
		speechText.textContent = "👋 Welcome! Click the character to chat. Type 'arcade' to see friendship progress.";
		addFriendshipBarToChatbox();
	} catch (e) {
		console.error('chatbot restore failed:', e);
	}
});
