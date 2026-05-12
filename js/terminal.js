(function() {
    'use strict';

    const commands = {
        help: () => `<span class="response-accent">Available commands:</span>
<span class="response">  about        — who I am
  experience   — work history
  skills       — technical toolkit
  projects     — open source & side projects
  contact      — reach out
  whoami       — who are you?
  ls           — list directory
  cat          — read files
  clear        — clear terminal
  sudo hire animesh — ???</span>`,

        about: () => `<span class="response-highlight">Animesh Agrawal</span>
<span class="response">Platform Engineer at Dream11 — India's largest fantasy sports platform.
I architect identity, authentication, and edge infrastructure serving 260M+ users.
I build AI-native developer tools (MCP servers, agentic workflows) and
open-source infrastructure operating at 10M+ RPS.

UC Irvine CS '20 · Based in Mumbai, India</span>`,

        experience: () => `<span class="response-accent">━━━ Work History ━━━</span>

<span class="response-highlight">▸ Software Engineer III @ Dream11</span>
<span class="response">  Dec 2021 – Present | Mumbai, India
  • Auth platform: 260M+ users, 10M+ RPS, 16M+ concurrent sessions
  • Built MCP server for AI-agent-driven tenant onboarding
  • Agentic AI workflow for internal knowledge search
  • Kong API Gateway edge layer (Lua plugins)
  • GraphQL Federation (Apollo Router + Rust)
  • Observability frameworks — 40% MTTR improvement</span>

<span class="response-highlight">▸ Senior Software Engineer @ INDmoney</span>
<span class="response">  Jul 2020 – Dec 2021 | Gurgaon, India
  • Kafka real-time streaming for 1.5M+ users
  • Automated pipeline: 6 hours → 10 minutes
  • 5x DAU growth · Led team of 3</span>

<span class="response-highlight">▸ Software Research Intern @ Adobe</span>
<span class="response">  Jun 2019 – Sep 2019 | Noida, India
  • Explainable AI / black-box ML interpretation
  • 95% model fidelity · Research publications</span>`,

        skills: () => `<span class="response-accent">━━━ Technical Skills ━━━</span>

<span class="response-highlight">Languages</span>     <span class="response">Java · Python</span>
<span class="response-highlight">Frameworks</span>    <span class="response">Spring Boot · Flask · Apollo GraphQL</span>
<span class="response-highlight">Infrastructure</span><span class="response"> Kafka · Kong · AWS (EKS, Lambda, SQS, DynamoDB)</span>
<span class="response-highlight">Expertise</span>     <span class="response">Distributed Systems · OAuth2.1/OIDC · API Gateways</span>
<span class="response-highlight">AI/ML</span>         <span class="response">MCP Servers · Agentic Workflows · Explainable AI</span>
<span class="response-highlight">Observability</span> <span class="response">Datadog · Custom SLOs · Cost Optimization</span>`,

        projects: () => `<span class="response-accent">━━━ Projects ━━━</span>

<span class="response-highlight">▸ Kong Scalable Rate Limiter</span>
<span class="response">  High-performance rate limiting for Kong at Dream11 scale
  → github.com/dream11/kong-scalable-rate-limiter</span>

<span class="response-highlight">▸ Guardian</span>
<span class="response">  Auth & authorization framework for distributed systems
  → github.com/dream-horizon-org/guardian</span>

<span class="response-highlight">▸ Crafted</span>
<span class="response">  E-commerce platform with automated CRM — built during COVID
  → craftedforyou.in</span>`,

        contact: () => `<span class="response-accent">━━━ Let's Connect ━━━</span>

<span class="response">  LinkedIn  → linkedin.com/in/animeshagrawal23
  GitHub    → github.com/aanimesh23</span>

<span class="response-highlight">DMs are open. Let's build something.</span>`,

        whoami: () => `<span class="response">visitor@animeshagrawal.com ~ you seem curious 👀
Type 'help' to discover more.</span>`,

        ls: () => `<span class="response">drwxr-xr-x  about/
drwxr-xr-x  experience/
drwxr-xr-x  projects/
-rw-r--r--  skills.json
-rw-r--r--  contact.txt
-rw-r--r--  .secret</span>`,

        clear: () => 'CLEAR',

        'cat .secret': () => `<span class="response">🤫 I once debugged a production issue at 3am using only
printf statements. Don't tell anyone.</span>`,

        'cat skills.json': () => `<span class="response">{
  "core": ["Java", "Python", "Distributed Systems"],
  "currently_obsessed_with": "AI Agents & MCP",
  "superpower": "Making things scale to millions"
}</span>`,

        'cat contact.txt': () => commands.contact(),

        'sudo hire animesh': () => `<span class="response-accent">⚡ Permission granted.</span>
<span class="response">Initializing recruitment protocol...
Compiling 6+ years of distributed systems experience...
Loading 260M+ user scale credentials...
</span><span class="response-highlight">✓ Ready. Redirecting to LinkedIn...</span>`,
    };

    const aliases = {
        'cat resume.txt': () => `<span class="response">No resume file here. But you can explore with:
  'experience' — work history
  'skills' — technical toolkit
  'about' — the full picture</span>`,
        'rm -rf /': () => `<span class="response">Nice try. 🙃 Permission denied.</span>`,
        'exit': () => `<span class="response">You can't escape that easily. Try scrolling down instead.</span>`,
        'pwd': () => `<span class="response">/home/animesh/portfolio</span>`,
        'cd ..': () => `<span class="response">You're already at the root of my world.</span>`,
        'echo hello': () => `<span class="response">hello back! 👋</span>`,
        'neofetch': () => `<span class="response-accent">        ╭─────────────────╮
        │  animesh@web     │
        ╰─────────────────╯</span>
<span class="response">  OS:       macOS (probably)
  Role:     Platform Engineer
  Company:  Dream11
  Scale:    260M+ users
  Stack:    Java, Kafka, Kong, AWS
  Uptime:   6+ years in production</span>`,
    };

    let commandHistory = [];
    let historyIndex = -1;
    let terminalReady = false;

    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    function addOutput(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        output.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function processCommand(cmd) {
        const trimmed = cmd.trim().toLowerCase();

        addOutput(`<span class="cmd-line">❯ ${cmd}</span>`);

        if (trimmed === '') return;

        commandHistory.unshift(trimmed);
        historyIndex = -1;

        if (trimmed === 'clear') {
            output.innerHTML = '';
            return;
        }

        const handler = commands[trimmed] || aliases[trimmed];

        if (handler) {
            const result = handler();
            if (result !== 'CLEAR') {
                addOutput(result);
            }
            if (trimmed === 'sudo hire animesh') {
                setTimeout(() => {
                    window.open('https://www.linkedin.com/in/animeshagrawal23/', '_blank');
                }, 2000);
            }
        } else {
            addOutput(`<span class="response">command not found: ${trimmed}. Type 'help' for available commands.</span>`);
        }
    }

    function initTerminal() {
        if (terminalReady) return;
        terminalReady = true;

        addOutput(`<span class="response-accent">Welcome to animesh's terminal.</span>
<span class="response">Type 'help' to see available commands.</span>`);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const partial = input.value.trim().toLowerCase();
            const allCommands = [...Object.keys(commands), ...Object.keys(aliases)];
            const match = allCommands.find(c => c.startsWith(partial));
            if (match) input.value = match;
        }
    });

    // Focus terminal when clicking anywhere in terminal body
    document.getElementById('terminal').addEventListener('click', () => {
        input.focus();
    });

    // Initialize terminal when it scrolls into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initTerminal();
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(document.getElementById('section-terminal'));
})();
