// ── SMOOTH SCROLL ──
// Makes navbar links scroll smoothly instead of jumping
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── NAVBAR HIGHLIGHT ──
// Highlights the active nav link as you scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  let current = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.id;
    }
  });

  links.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current
      ? 'white'
      : 'rgba(255,255,255,0.65)';
  });
});

// ── FADE IN ON SCROLL ──
// Sections fade in as you scroll down to them
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// ── CONTACT FORM ──
// Handles form submission without leaving the page
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        document.getElementById('form-success').style.display = 'block';
        form.reset();
        btn.textContent = 'Sent! ✓';
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      document.getElementById('form-error').style.display = 'block';
      btn.textContent = 'Send Message ✉';
      btn.disabled = false;
    }
  });
}

// ── DARK MODE ──
const toggle = document.getElementById('theme-toggle');

// Remember user preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  toggle.textContent = '☀️';
}

toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ── MINI TERMINAL HELPER ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function miniType(termId, lines) {
  const term = document.getElementById(termId);
  const cursor = term.querySelector('.mt-cursor');
  if (cursor) cursor.remove();

  for (const [cls, text] of lines) {
    const div = document.createElement('div');
    div.className = 'mt-line';
    if (cls === 'blank') {
      div.innerHTML = '&nbsp;';
    } else if (cls === 'cmd') {
      div.innerHTML = `<span class="mt-cmd">${text}</span>`;
      term.appendChild(div);
      term.scrollTop = term.scrollHeight;
      await sleep(200);
      continue;
    } else {
      div.className = `mt-line mt-${cls}`;
      div.textContent = text;
    }
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
    await sleep(120);
  }

  const cur = document.createElement('span');
  cur.className = 'mt-cursor';
  term.appendChild(cur);
  term.scrollTop = term.scrollHeight;
}

function enableStep(id) { document.getElementById(id).disabled = false; }

// ── IDS STEPS ──
let idsBusy = false;

async function idsStep(n) {
  if (idsBusy) return;
  idsBusy = true;
  document.getElementById('ids-s' + n).disabled = true;

  const steps = {
    1: [
      ['cmd', 'node server.js && python3 ids_bridge.py'],
      ['success', 'Server running on port 3000'],
      ['success', '* Running on http://127.0.0.1:5000'],
      ['success', '[✓] SVM model loaded — 98.88% accuracy'],
    ],
    2: [
      ['blank', ''],
      ['out', 'Received: { duration:0, service:http, flag:SF }'],
      ['success', 'IDS Prediction: normal ✓'],
      ['out', 'Received: { duration:0, service:http, flag:SF }'],
      ['success', 'IDS Prediction: normal ✓'],
    ],
    3: [
      ['blank', ''],
      ['cmd', 'curl -X POST http://localhost:3000/data -d attack_payload'],
      ['warn', 'Payload: FTP, S0 flag, root_shell:1, failed_logins:3'],
      ['out', 'Forwarding to Python IDS @ :5000...'],
    ],
    4: [
      ['blank', ''],
      ['alert', '🚨 IDS Prediction: anomaly'],
      ['alert', '🚨 ALERT: Attack detected! anomaly'],
      ['alert', '🚨 IDS Prediction: anomaly'],
      ['alert', '🚨 ALERT: Attack detected! anomaly'],
    ],
    5: [
      ['blank', ''],
      ['success', 'F1 Score:  0.9895'],
      ['success', 'Accuracy:  98.88%'],
      ['success', '★ Normal: PASSED · Attack: DETECTED ★'],
    ],
  };

  await miniType('ids-term', steps[n]);
  if (n < 5) enableStep('ids-s' + (n + 1));
  idsBusy = false;
}

function idsReset() {
  document.getElementById('ids-term').innerHTML = `
    <div class="mt-line mt-dim"># IoT IDS — click steps to walk through</div>
    <div class="mt-line mt-dim">Architecture: ESP8266 → Node.js:3000 → Flask:5000 → SVM</div>
    <div class="mt-line">&nbsp;</div>
    <span class="mt-cursor"></span>
  `;
  for (let i = 1; i <= 5; i++) {
    document.getElementById('ids-s' + i).disabled = i !== 1;
  }
  idsBusy = false;
}

// ── PURPLE TEAM STEPS ──
let ptBusy = false;

async function ptStep(n) {
  if (ptBusy) return;
  ptBusy = true;
  document.getElementById('pt-s' + n).disabled = true;

  const steps = {
    1: [
      ['cmd', 'nmap -sV --open -T4 -p 80,443,3000 172.20.10.6'],
      ['warn', 'PORT   STATE SERVICE  VERSION'],
      ['success', '80/tcp open  http     ESP8266 v1.0.0'],
      ['danger', '⚠ VERSION DISCLOSURE — Firmware exposed'],
      ['danger', '⚠ PORT 80 — Unencrypted HTTP, no auth'],
    ],
    2: [
      ['blank', ''],
      ['cmd', 'msfconsole -q → use auxiliary/scanner/http/http_version'],
      ['success', '[+] 172.20.10.6:80 ESP8266-WebServer/1.0 (200 OK)'],
      ['danger', '[!] Firmware version leaked via Server header'],
      ['danger', '[!] No authentication on any endpoint'],
    ],
    3: [
      ['blank', ''],
      ['cmd', 'curl -s http://172.20.10.6/admin'],
      ['warn', 'Admin Panel — Username: admin / Password: admin123'],
      ['danger', '⚠ CRITICAL: Unauthenticated admin access'],
      ['danger', '⚠ CRITICAL: Default credentials exposed'],
    ],
    4: [
      ['blank', ''],
      ['alert', '🚨 IDS Prediction: anomaly'],
      ['alert', '🚨 ALERT: Attack detected! anomaly'],
      ['success', '[✓] SVM model flagged scan traffic in real time'],
    ],
    5: [
      ['blank', ''],
      ['cmd', 'sudo iptables -A INPUT -p tcp --dport 80 -j DROP'],
      ['success', '[✓] Port 80 blocked'],
      ['success', '[✓] Admin endpoint revoked'],
      ['success', '[✓] Default credentials changed'],
    ],
    6: [
      ['blank', ''],
      ['cmd', 'nmap -sV --open -T4 -p 80,443,3000 172.20.10.6'],
      ['out', 'All scanned ports are filtered'],
      ['success', '[✓] Port 80: CLOSED'],
      ['success', '★ Attack → Detect → Defend: Complete ★'],
    ],
  };

  await miniType('pt-term', steps[n]);
  if (n < 6) enableStep('pt-s' + (n + 1));
  ptBusy = false;
}

function ptReset() {
  document.getElementById('pt-term').innerHTML = `
    <div class="mt-line mt-dim"># Purple Team Lab — click steps to walk through</div>
    <div class="mt-line mt-dim">Target: NodeMCU ESP8266 @ 172.20.10.6</div>
    <div class="mt-line">&nbsp;</div>
    <span class="mt-cursor"></span>
  `;
  for (let i = 1; i <= 6; i++) {
    document.getElementById('pt-s' + i).disabled = i !== 1;
  }
  ptBusy = false;
}s