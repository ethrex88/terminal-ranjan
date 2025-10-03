import React from 'react';
import Terminal from './Terminal';
import Card3D from './Card3D';

export default function App() {
  const commands = ['help','about','projects','skills','experience','education','certifications','contact','social','resume','clear'];

  return (
    <div className="app">
              <header className="header">
          <div className="title">
            <div className="name">Ranjan Kumar</div>
            <div className="subtitle">Software Engineer</div>
          </div>
        </header>

      <div className="content">
        <aside className="left">
          <Card3D />
          <div className="card-foot">[Interactive 3D Card]</div>
        </aside>

        <main className="right">
          <nav className="topnav" aria-label="commands">
            {commands.map(c => (
              <button key={c} className="nav-link" onClick={() => {
                // trigger a custom event so Terminal can pick it up
                window.dispatchEvent(new CustomEvent('run-command', { detail: c }));
              }}>{c}</button>
            ))}
          </nav>

          <div className="terminal-wrap">
            <Terminal />
          </div>
        </main>
      </div>

              <footer className="statusbar">
          <div className="status-left">ranjan@portfolio:~$</div>
          <div className="status-right">{new Date().toLocaleString()}</div>
        </footer>
    </div>
  );
}
