/* ─── VishwaBot · portfolio chatbot (redesigned) ─── */
const STYLES = `
#vb-chat-fab{position:fixed;bottom:28px;right:28px;z-index:9000;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#9683ad,#7c6b8f);border:none;color:#fff;cursor:pointer;box-shadow:0 4px 20px #7c6b8f44;display:grid;place-items:center;transition:transform .25s,box-shadow .25s}
#vb-chat-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px #7c6b8f66}
#vb-chat-fab svg{width:22px;height:22px;stroke-width:1.8;transition:transform .25s}
#vb-chat-fab.open svg{transform:rotate(90deg)}
#vb-chat-panel{position:fixed;bottom:92px;right:28px;z-index:9000;width:370px;max-width:calc(100vw - 40px);max-height:min(520px,70vh);border-radius:18px;background:#fafbfe;border:1px solid #e1e5ec;box-shadow:0 12px 45px #26304714;display:none;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif}
#vb-chat-panel.show{display:flex}
.vb-chat-head{padding:18px 20px;border-bottom:1px solid #e7eaf0;display:flex;align-items:center;gap:12px;background:#f3f1f8}
.vb-chat-head .vb-avatar{width:34px;height:34px;background:#e9e4f3;border-radius:10px;display:grid;place-items:center;font-family:Georgia,serif;font-size:19px;letter-spacing:-2px;color:#7c6b8f;flex-shrink:0}
.vb-chat-head strong{font-size:14px;color:#263047;font-weight:600}
.vb-chat-head small{display:block;font-size:10px;color:#9399a7;letter-spacing:.5px;margin-top:3px}
.vb-chat-log{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.vb-msg{max-width:82%;padding:11px 15px;border-radius:14px;font-size:13px;line-height:1.7;word-break:break-word;animation:vb-fadein .25s ease}
.vb-msg.bot{background:#ede9f5;color:#3d3856;border-bottom-left-radius:4px;align-self:flex-start}
.vb-msg.user{background:#263047;color:#f0f2f5;border-bottom-right-radius:4px;align-self:flex-end}
.vb-chat-bar{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e7eaf0;background:#fbfcfe}
.vb-chat-bar input{flex:1;min-width:0;border:1px solid #dce1eb;border-radius:10px;padding:10px 14px;font-size:13px;background:#f6f7fa;color:#263047;outline:none;transition:border-color .2s}
.vb-chat-bar input:focus{border-color:#9683ad}
.vb-chat-bar input::placeholder{color:#adb3c0}
.vb-chat-bar button{width:38px;height:38px;border:none;border-radius:10px;background:#7c6b8f;color:#fff;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:background .2s}
.vb-chat-bar button:hover{background:#675978}
.vb-chat-bar button svg{width:16px;height:16px;stroke-width:2}
.vb-quick-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 18px 12px}
.vb-chip{border:1px solid #dce1eb;border-radius:20px;padding:6px 13px;font-size:11px;color:#71798a;cursor:pointer;background:none;transition:background .2s,color .2s}
.vb-chip:hover{background:#ede9f5;color:#5b4e6f;border-color:#d1c8e1}
@keyframes vb-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:480px){#vb-chat-panel{bottom:0;right:0;left:0;width:100%;max-width:100%;max-height:80vh;border-radius:18px 18px 0 0}#vb-chat-fab{bottom:18px;right:18px}}
`;

const SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>';
const CHAT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
const X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

class VishwaBot {
  constructor() { this.rejectionCount = 0; }

  classify(t) {
    const x = t.toLowerCase();
    if (/(hi|hello|hey)\b/.test(x)) return 'greetings';
    if (/(project|work|built)/.test(x)) return 'projects';
    if (/(skill|tech|programming|stack)/.test(x)) return 'skills';
    if (/(school|college|university|education|gpa)/.test(x)) return 'school';
    if (/(contact|email|reach|hire)/.test(x)) return 'contact';
    if (/(certificate|certification|credential)/.test(x)) return 'certificates';
    if (/(resume|cv)\b/.test(x)) return 'resume';
    if (/(joke|funny|laugh)/.test(x)) return 'joke';
    if (/(hobby|hobbies|free time|interest|passion)/.test(x)) return 'hobbies';
    if (/(music|song|listen|artist|band)/.test(x)) return 'music';
    if (/(who are you|what are you|about you|your name)/.test(x)) return 'identity';
    if (/(thank|thanks|appreciate)/.test(x)) return 'gratitude';
    if (/(sad|unhappy|depressed|feeling down)/.test(x)) return 'sympathy';
    if (/(yes|yep|yeah|sure|okay|ok|sounds good)/.test(x)) return 'affirmative';
    if (/(fun|cool|awesome|nice|great|love)/.test(x)) return 'positive';
    if (/(no|nope|stop|boring|meh|go away)/.test(x)) return 'rejection';
    if (/(help|guide|what can)/.test(x)) return 'help';
    if (/(playground|bloom|flower|qr)/.test(x)) return 'playground';
    if (/(experience|intern|job)/.test(x)) return 'experience';
    return 'unknown';
  }

  async joke() {
    try {
      const r = await fetch('https://official-joke-api.appspot.com/random_joke');
      const j = await r.json();
      return `${j.setup} … ${j.punchline} 😄`;
    } catch {
      const jokes = [
        'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
        "How many programmers does it take to change a light bulb? None — that's a hardware problem! 💡",
        "Why do Java developers wear glasses? Because they can't C#! 👓",
        "What's a programmer's favorite hangout place? The Foo Bar! 🍺",
        "Why did the developer go broke? He used up all his cache! 💸",
        "How do you comfort a JavaScript bug? You console it! 🖥️",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
  }

  async reply(msg) {
    const cat = this.classify(msg);
    switch (cat) {
      case 'greetings': return "Hey! 👋 I'm Vishwa's portfolio assistant. Ask me about projects, skills, or experience — or just say hi.";
      case 'projects': return "I've built 3D web experiences with Three.js, AI-powered tools, and interactive websites. Check them out on the <a href='projects.html'>Work page</a>!";
      case 'skills': return "My stack includes Python, JavaScript, React, Three.js, PostgreSQL, and AI/ML frameworks. I also love UI/UX design — ask me anything specific!";
      case 'school': return "I'm studying Computer Science at Texas Tech University. I'm active in GDSC and CodePath, where I mentor students in web development.";
      case 'contact': return "Reach me at <a href='mailto:vishwa.belaganti@gmail.com'>vishwa.belaganti@gmail.com</a>. I'm also on <a href='https://www.linkedin.com/in/vishwa-belaganti/' target='_blank'>LinkedIn</a> and <a href='https://github.com/Vishwabelaganti' target='_blank'>GitHub</a>.";
      case 'certificates': return "I've earned certifications in Google Cybersecurity, Python, MySQL, and Figma UI/UX. See them on the <a href='certificates.html'>Credentials page</a>.";
      case 'resume': window.open('files/Vishwa_Belaganti_Resume.pdf', '_blank'); return "Opening resume in a new tab! 📄";
      case 'joke': return await this.joke();
      case 'hobbies': return "When I'm not coding — soccer, gym, drawing, and trying new dessert recipes. Baking is my stress reliever! 🎨⚽";
      case 'music': return "Big fan of Stephan Sanchez, plus lofi beats for coding sessions and ambient rain sounds for focus. 🎵";
      case 'identity': return "I'm Vishwa's portfolio companion — here to help you explore projects, learn about skills, or just chat.";
      case 'gratitude': return "Happy to help! Feel free to ask anything else. 😊";
      case 'sympathy': return "I'm sorry to hear that. How about a quick joke to brighten your day? Just say 'joke'!";
      case 'affirmative': return "Great! Want to hear about my projects, skills, or something else?";
      case 'positive': return "Thanks for the kind words! 😊 Want to explore the <a href='playground.html'>Playground</a> for something interactive?";
      case 'rejection': this.rejectionCount++; return this.rejectionCount >= 2 ? await this.joke() : "Fair enough — how about a quick joke instead?";
      case 'help': return "Try asking about: <b>projects</b>, <b>skills</b>, <b>experience</b>, <b>education</b>, <b>resume</b>, <b>contact</b>, or say <b>joke</b> for a laugh!";
      case 'playground': return "The Playground is where I keep experiments — like the <a href='bloom/'>Floral QR</a> bouquet! Check it out on the <a href='playground.html'>Playground page</a>.";
      case 'experience': return "I'm currently an Automation Intern at CtrlS Datacenters, building CMDB tools and 3D navigation. Before that, I was a Grading Assistant for Data Structures at Texas Tech. More on the <a href='experience.html'>Experience page</a>.";
      default: return "I'm not sure I caught that! Try asking about projects, skills, experience, or say 'help' for ideas.";
    }
  }
}

export function initChatbot() {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);

  // FAB button
  const fab = document.createElement('button');
  fab.id = 'vb-chat-fab';
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = CHAT_ICON;
  document.body.appendChild(fab);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'vb-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat with Vishwa');
  panel.innerHTML = `
    <div class="vb-chat-head">
      <div class="vb-avatar">vb.</div>
      <div><strong>Vishwa</strong><small>Portfolio assistant</small></div>
    </div>
    <div class="vb-chat-log" id="vb-chat-log"></div>
    <div class="vb-quick-chips" id="vb-chips">
      <button class="vb-chip" data-q="What projects have you built?">Projects</button>
      <button class="vb-chip" data-q="What are your skills?">Skills</button>
      <button class="vb-chip" data-q="Tell me about your experience">Experience</button>
      <button class="vb-chip" data-q="Tell me a joke">Joke</button>
    </div>
    <div class="vb-chat-bar">
      <input id="vb-chat-input" type="text" placeholder="Ask me anything…" autocomplete="off">
      <button id="vb-chat-send" aria-label="Send">${SEND_ICON}</button>
    </div>`;
  document.body.appendChild(panel);

  const log = panel.querySelector('#vb-chat-log');
  const input = panel.querySelector('#vb-chat-input');
  const sendBtn = panel.querySelector('#vb-chat-send');
  const chips = panel.querySelector('#vb-chips');
  const bot = new VishwaBot();

  function addMsg(text, sender = 'bot') {
    const el = document.createElement('div');
    el.className = `vb-msg ${sender}`;
    el.innerHTML = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  // Greeting
  addMsg("Hey! 👋 I'm Vishwa's portfolio assistant. Ask me about projects, skills, or just say hi.");

  async function send(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    chips.style.display = 'none';
    const reply = await bot.reply(text);
    addMsg(reply);
  }

  // Toggle
  fab.addEventListener('click', () => {
    const open = panel.classList.toggle('show');
    fab.classList.toggle('open', open);
    fab.innerHTML = open ? X_ICON : CHAT_ICON;
    fab.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if (open) input.focus();
  });

  // Send
  sendBtn.addEventListener('click', () => { send(input.value); input.value = ''; });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { send(input.value); input.value = ''; } });

  // Chips
  chips.addEventListener('click', e => {
    const chip = e.target.closest('.vb-chip');
    if (chip) send(chip.dataset.q);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('show')) fab.click();
  });
}
