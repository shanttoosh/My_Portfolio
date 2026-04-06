import React, { useState, useCallback } from 'react';

// Background layers
import AuroraGradient from './components/background/AuroraGradient';
import NeuralNetwork from './components/background/NeuralNetwork';
import ScanlineOverlay from './components/background/ScanlineOverlay';
import DataStream from './components/background/DataStream';

// UI utilities
import ScrollProgress from './components/ui/ScrollProgress';

// Sections
import Navigation from './components/sections/Navigation';
import Hero from './components/sections/Hero';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import Chatbot from './components/sections/Chatbot';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';

// Effects
import KonamiEasterEgg from './components/effects/KonamiEasterEgg';

export default function App() {
  const [isAIThinking, setIsAIThinking] = useState(false);

  const handleChatClick = useCallback(() => {
    const el = document.getElementById('chat');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{ background: '#050810', minHeight: '100vh', position: 'relative' }}>
      <AuroraGradient />
      <NeuralNetwork isThinking={isAIThinking} />
      <ScanlineOverlay />
      <DataStream />
      <ScrollProgress />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navigation />
        <main>
          <Hero onChatClick={handleChatClick} />
          <SectionDivider />
          <Projects />
          <SectionDivider />
          <Experience />
          <SectionDivider />
          <Skills />
          <SectionDivider />
          <Chatbot onThinkingChange={setIsAIThinking} />
          <SectionDivider />
          <Contact />
        </main>
        <Footer />
      </div>

      <KonamiEasterEgg />
    </div>
  );
}

function SectionDivider() {
  return (
    <div style={{ width: '100%', height: 40, position: 'relative', zIndex: 10, overflow: 'hidden', padding: '0 24px' }}>
      <svg width="100%" height="40" viewBox="0 0 1440 40" preserveAspectRatio="none">
        <path
          d="M0,20 L120,20 L140,5 L160,35 L180,5 L200,35 L220,20 L1440,20"
          stroke="rgba(0,255,156,0.2)"
          strokeWidth="1.5"
          fill="none"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,156,0.3))' }}
        />
      </svg>
    </div>
  );
}
