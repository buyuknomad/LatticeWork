import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import BackgroundAnimation from './components/BackgroundAnimation';

function App() {
  return (
    <div className="relative min-h-screen bg-[#1A1A1A] text-white overflow-hidden">
      <BackgroundAnimation />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;