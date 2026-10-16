import BrandMark from './BrandMark';

export default function ConnectionScreen() {
  return (
    <main className="connection-screen" role="status" aria-live="polite">
      <div className="connection-card">
        <div className="connection-brand"><BrandMark className="connection-mark" decorative /><span>arova<span className="brand-period">.</span></span></div>
        <div className="connection-art" aria-hidden="true">
          <span className="connection-ring connection-ring-one" />
          <span className="connection-ring connection-ring-two" />
          <span className="connection-spark">✳</span>
          <span className="connection-dot" />
        </div>
        <p className="connection-eyebrow">AROVA</p>
        <h1>Just a moment.</h1>
        <p className="connection-copy">Checking your session…</p>
        <div className="connection-progress" aria-hidden="true"><span /></div>
        <p className="connection-status">PLEASE WAIT</p>
      </div>
      <p className="connection-foot">THOUGHTFULLY CHOSEN</p>
    </main>
  );
}
