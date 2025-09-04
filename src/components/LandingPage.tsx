import React from 'react';

function LandingPage({ isVisible }: { isVisible: boolean }) {
  return (
    <div className={`scroll-container ${isVisible ? 'visible' : ''}`}>
      <div className="landing-page">
        <section className="section">
          <div className="content-box">
            <h1 className="title">The Spark</h1>
            <p>An interactive journey into procedural life.</p>
            <div className="scroll-prompt">Scroll Down</div>
          </div>
        </section>

        <section className="section">
          <div className="content-box">
            <h2>Emergence</h2>
            <p>From a single point, a swarm of life emerges.</p>
          </div>
        </section>

        <section className="section">
          <div className="content-box">
            <h2>Outliers</h2>
            <p>Unique patterns form, hinting at complex structures.</p>
          </div>
        </section>

        <section className="section">
          <div className="content-box">
            <h2>Symbiosis</h2>
            <p>The system becomes one with its environment.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
