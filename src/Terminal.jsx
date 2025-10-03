import React, { useEffect, useRef, useState } from 'react';
import TypingText from './TypingText';
import { playKeySound, enableAudio } from './utils/keyboardSound';

const PROMPT = 'ranjan@portfolio:~$';

const ASCII_BANNER = `
██████╗  █████╗ ███╗   ██╗     ██╗ █████╗ ███╗   ██╗
██╔══██╗██╔══██╗████╗  ██║     ██║██╔══██╗████╗  ██║
██████╔╝███████║██╔██╗ ██║     ██║███████║██╔██╗ ██║
██╔══██╗██╔══██║██║╚██╗██║██   ██║██╔══██║██║╚██╗██║
██║  ██║██║  ██║██║ ╚████║╚█████╔╝██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝

██╗  ██╗██╗   ██╗███╗   ███╗ █████╗ ██████╗ 
██║ ██╔╝██║   ██║████╗ ████║██╔══██╗██╔══██╗
█████╔╝ ██║   ██║██╔████╔██║███████║██████╔╝
██╔═██╗ ██║   ██║██║╚██╔╝██║██╔══██║██╔══██╗
██║  ██╗╚██████╔╝██║ ╚═╝ ██║██║  ██║██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

    Software Engineer | Full-Stack Developer
`;

const WELCOME_MESSAGE = `${ASCII_BANNER}

Welcome to my interactive AI-powered portfolio terminal!
Type 'help' to see available commands or try 'about' to learn more about me.

💡 Pro Tips:
  • Use TAB for command autocompletion
  • Use ↑/↓ arrow keys to navigate command history
  • Type 'social' to connect with me on social media
`;

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: 'output', content: WELCOME_MESSAGE, animated: false }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // focus
    inputRef.current?.focus();

    // listen to nav clicks from App
    const onRun = (e) => {
      runCommand(e.detail);
    };
    window.addEventListener('run-command', onRun);
    return () => window.removeEventListener('run-command', onRun);
  }, []);

  useEffect(() => {
    // auto-scroll
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

//   function appendOutput(text, animated = true) {
//     setHistory(h => [...h, { type: 'output', content: text, animated }]);
//   }

  function appendOutput(content, animated = true) {
    setHistory(h => [...h, { type: 'output', content, animated }]);
  }

  function appendError(text) {
    setHistory(h => [...h, { type: 'error', content: text, animated: false }]);
  }

  const commands = ['help','about','projects','skills','experience','contact','education','certifications','social','resume','clear','sudo'];

  function runCommand(cmdRaw) {
    const cmd = (cmdRaw || input).trim();
    if (!cmd) {
      setInput('');
      return;
    }
    
    // Add to command history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    setHistory(h => [...h, { type: 'command', content: cmd }]);
    setInput('');
    
    // simple parser
    switch (cmd.toLowerCase()) {
      case 'help':
        appendOutput(`📋 Available Commands:

about          - Learn more about me
skills         - View my technical skills
experience     - Check my work experience
projects       - See my featured projects
education      - View my educational background
certifications - List my professional certifications
contact        - Get my contact information
social         - Connect with me on social media
resume         - Download my resume (PDF)
clear          - Clear the terminal screen
sudo           - Try at your own risk 😉

💡 Tips:
  • Press TAB for autocomplete
  • Use ↑/↓ arrows for command history

Type any command to get started!`);
        break;
      case 'about':
        appendOutput(`👋 About Me:

Hi, I'm Ranjan Kumar, a passionate Software Engineer/FullStack with experience in building and 
improving web application & scalable backend systems, deliver high-quality software and improve overall product performance.

🎯 What I Do:
• Design and develop full-stack web applications
• Build cloud-native microservices architectures
• Create intuitive and responsive user interfaces
• Generative AI/ Prompt Engineering.

💡 I'm passionate about clean code, best practices, and continuous learning.
Always excited to work on challenging projects and collaborate with talented teams!`);
        break;
      case 'projects':
        appendOutput(`🚀 Featured Projects:

1. Interactive Portfolio Terminal
   - Tech: React, TypeScript, Vite
   - Features: Terminal-style UI, command execution, 3D card
   
2. Kiptox - Ethereum wallet
   - Tech: React, Node.js, WebSockets, Solidity, Ethereum
   - Features: Real time transaction, wallet balance, transaction history, etc.
   
3. ClipGrap - AI Powered Clip Downloader
   - Tech: React, Typescript, Rest API, Gemini API
   - Features: AI Powered Clip Downloader`);
        break;
      case 'skills':
        appendOutput(`💻 Technical Skills:

Programming Languages:
- JavaScript/TypeScript
- Python
- Java
- C++

Frontend:
- React.js/Next.js
- Redux/
- Material UI
- Tailwind CSS
- Jest
- Cypress
- Storybook
- Jira
- Confluence
- Figma

Backend:
- Node.js/Express
- Nest.js/Rest API
- SQL (PostgreSQL)
- NOSQL (Couchbase)
- Git
- Github
- Gitlab
- Postman


Cloud & DevOps:
- AWS
- Docker/Kubernetes(Basic)
- Grafana & Prometheus
- CI/CD Pipelines

AI & GenAI & Tools:
- Generative AI
- Prompt Engineering
- LLM (Claude, Copilot)
- MCP Server
- Gemini API
- OpenAI API
`);
        break;
      case 'experience':
        appendOutput(`💼 Professional Experience:

Software Engineer Experience| Amdocs
📅 Jun 2022 - Present

• Engineered and deployed on 10+ microservices 
• Architected high-availability APIs that improved system throughput by 35%, ensuring smooth integration across distributed systems.
• Delivered customer-facing features in React + TypeScript, reducing page load times by 30% and boosting user engagement by 20%.
• Delivered fixes for 450+ bugs and implemented 75+ new features.
• Automated telecom workflows using Generative AI + LLMs, cutting manual intervention.
• Partnered with QA and product teams to improve release quality, reducing post-production defects by 25%.
• Contributed to system design (HLD + LLD) for complex telecom solutions, reducing feature onboarding time by 20%.
• Leveraged AWS, Docker, and Kubernetes to optimize CI/CD pipelines, accelerating deployment.

Web Developer | WalkOver
📅 Jan 2021 - Jun 2021
• Developed web applications
• HTML, CSS, JavaScript, React, Rest API
• Collaborated with cross-functional teams`);
        break;
      case 'education':
        appendOutput(`🎓 Education:

Bachelor of Technology in Computer Science & Engineering
Silliguri Institute of Technology | 2018 - 2022
• GPA: 8.2/10
• Focus: Software Engineering, `);
        break;
      case 'certifications':
        appendOutput(`📜 Certifications:

• AWS Certified Solutions Architect
• Frontend Developer
• SQL
• Nodejs
• React
• Typescript
• Rest API
• Git
• Gitlab`);
        break;
      case 'contact':
        appendOutput(`📧 Contact Information:

Email: ranjankr.sit8@gmail.com
LinkedIn: https://linkedin.com/in/ranjankg
GitHub: https://github.com/ethrex88
Leetcode: https://leetcode.com/u/etherx/
Phone: +91 6200577604
Portfolio: ranjankumar.dev

Feel free to reach out for collaborations or opportunities!`);
        break;
      case 'social':
        appendOutput(`🌐 Connect with Me:

GitHub     → https://github.com/ethrex88
LinkedIn   → https://linkedin.com/in/ranjankg
Leetcode   → https://leetcode.com/u/etherx/
GFG        → https://www.geeksforgeeks.org/user/etherx
Email      → ranjankr.sit8@gmail.com
Phone      → +91 6200577604

💬 Let's connect and collaborate!`);
        break;
        case 'resume':
            appendOutput(
              <div>
                📄 Resume Download:
                <br /><br />
                <a 
                  href="/src/assets/RanjankrResumeFs.pdf" 
                  download="RanjanKumar_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#00ff66", textDecoration: "underline" }}
                >
                  📥 Download PDF
                </a>
                <br />
                <a 
                  href="https://drive.google.com/file/d/1T9UCgdnvfTxjXZBUzdQwmgEpXJ_ENz90/view" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#00ff66", textDecoration: "underline" }}
                >
                  🔗 Open on Google Drive
                </a>
              </div>,
              false
            );
            break;
          
      case 'clear':
        setHistory([]);
        break;
      case 'sudo':
        appendOutput(`Hi, I'm Ranjan Kumar, a Software Engineer & FullStack! 😎`);
        break; 
      default:
        // Find similar commands
        const similar = commands.find(c => 
          c.toLowerCase().startsWith(cmd.toLowerCase().charAt(0)) && 
          c.toLowerCase().includes(cmd.toLowerCase().substring(0, 3))
        );
        const suggestion = similar ? `\n\nDid you mean '${similar}'? Type 'help' for all commands.` : '';
        appendError(`bash: ${cmd}: command not found${suggestion}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Autocomplete logic
      const currentInput = input.toLowerCase().trim();
      if (currentInput) {
        const matches = commands.filter(cmd => cmd.startsWith(currentInput));
        if (matches.length === 1) {
          setInput(matches[0]);
        } else if (matches.length > 1) {
          // Show all matches
          appendOutput(`Available commands: ${matches.join(', ')}`);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate backward in history
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate forward in history
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  }

  return (
    <div className="terminal" onClick={() => {
      inputRef.current?.focus();
      enableAudio();
    }}>
      <div className="terminal-body" ref={containerRef}>
        {history.map((line, idx) => {
          if (line.type === 'command') {
            return (
              <div key={idx} className="line">
                <span className="prompt"><span className="prompt-user">{PROMPT}</span>&nbsp;</span>
                <span className="cmd">{line.content}</span>
              </div>
            );
          } else {
            // output text may have newlines
            const outputClass = line.type === 'error' ? 'output error' : 'output';
            return (
                <pre className={outputClass} key={idx}>
                {typeof line.content === "string" ? (
                  line.animated ? (
                    <TypingText text={line.content} speed={15} />
                  ) : (
                    line.content
                  )
                ) : (
                  line.content // if JSX, render directly
                )}
              </pre>              
            );
          }
        })}

        {/* current input */}
        <div className="line input-line">
          <span className="prompt"><span className="prompt-user">{PROMPT}</span>&nbsp;</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyPress={() => {
              playKeySound();
              enableAudio();
            }}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Terminal command input"
          />
          <span className="cursor" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
