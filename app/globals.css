:root {
  color-scheme: dark;
  --bg: #0b0b0d;
  --card: #151518;
  --text: #f8f8f8;
  --muted: #a8a8b3;
  --gold: #f5b942;
  --line: #2a2a31;
}

* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  background: radial-gradient(circle at top, #202026 0, var(--bg) 45%);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}
button, input { font: inherit; }

.page-shell { width: min(1100px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 60px; }
.topbar { display: flex; align-items: center; gap: 14px; }
.brand-mark {
  display: grid; place-items: center; width: 56px; height: 56px; border-radius: 18px;
  background: linear-gradient(135deg, #ffe39a, var(--gold)); color: #111; font-weight: 900;
  box-shadow: 0 12px 30px rgba(245, 185, 66, .25);
}
h1 { margin: 0; font-size: 28px; }
.topbar p { margin: 4px 0 0; color: var(--muted); }
.hero {
  margin-top: 42px; padding: 42px; border: 1px solid var(--line); border-radius: 28px;
  background: rgba(21, 21, 24, .86); backdrop-filter: blur(14px);
}
.hero h2 { font-size: clamp(32px, 6vw, 58px); margin: 20px 0 14px; max-width: 800px; }
.hero p { color: var(--muted); font-size: 18px; line-height: 1.7; max-width: 720px; }
.status { display: inline-flex; padding: 9px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; letter-spacing: .08em; }
.status.live { background: rgba(46, 204, 113, .16); color: #8ef0b5; }
.status.preview { background: rgba(245, 185, 66, .14); color: #ffd77a; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 18px; }
.steps article { padding: 24px; border: 1px solid var(--line); border-radius: 22px; background: var(--card); }
.steps strong { color: var(--gold); font-size: 28px; }
.steps h3 { margin: 14px 0 8px; }
.steps p { margin: 0; color: var(--muted); line-height: 1.55; }
@media (max-width: 760px) {
  .page-shell { width: min(100% - 20px, 1100px); padding-top: 18px; }
  .hero { padding: 26px 20px; margin-top: 28px; border-radius: 22px; }
  .steps { grid-template-columns: 1fr; }
}
