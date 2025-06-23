// src/pages/HomePage.tsx
import React from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import SeeItWork from '../components/SeeItWork';
import Differentiators from '../components/Differentiators';
import Features from '../components/Features';
import ExamplesSection from '../components/ExamplesSection'; // New import
import CallToAction from '../components/CallToAction';
import Pricing from '../components/Pricing';

const HomePage: React.FC = () => {
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Mind Lattice - Mental Models & Cognitive Bias Analysis Tool",
    "description": "AI-powered tool that reveals mental models and cognitive biases in any situation. Make better decisions in under 30 seconds.",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mindlattice.app"
      }]
    }
  };

  return (
    <>
      <SEO
        title="Mental Models & Cognitive Bias Analysis Tool"
        description="Discover the mental models and cognitive biases shaping any situation. AI-powered analysis for better decision-making. Try 3 free analyses daily."
        keywords="mental models tool, cognitive bias analyzer, decision making framework, thinking patterns, Charlie Munger mental models, AI decision analysis"
        url="/"
        schema={homeSchema}
      />
      <main>
        <Hero />
        <SeeItWork /> 
        <Differentiators />
        <Features />
        <ExamplesSection /> {/* Add the new section here */}
        <CallToAction />
        <Pricing />
      </main>
    </>
  );
};

export default HomePage;