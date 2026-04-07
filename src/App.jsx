import React, { useCallback } from 'react';

// Background layers
import AuroraGradient from './components/background/AuroraGradient';

// UI utilities
import ScrollProgress from './components/ui/ScrollProgress';

// Sections
import Navigation from './components/sections/Navigation';
import Hero from './components/sections/Hero';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import InteractiveTools from './components/sections/InteractiveTools';
import Chatbot from './components/sections/Chatbot';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';

// Effects
import KonamiEasterEgg from './components/effects/KonamiEasterEgg';

export default function App() {

  const handleChatClick = useCallback(() => {
    const el = document.getElementById('chat');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{ background: '#050810', minHeight: '100vh', position: 'relative' }}>
      <AuroraGradient />
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
          <InteractiveTools />
          <SectionDivider />
          <Chatbot />
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
    <div style={{
      width: '100%',
      height: 1,
      background: 'rgba(255,255,255,0.05)',
      margin: '0 auto',
      maxWidth: 1100,
    }} />
  );
}
