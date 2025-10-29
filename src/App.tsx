import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import QuoteCard from './components/QuoteCard';
import GapFinder from './components/GapFinder';
import Trends from './components/TrendsCard';
import FnoFilters from './pages/FnoFilters';
import FnoLive from './pages/FNOLive';

function Home() {
  return <GapFinder />;
}

function About() {
  return <h2>About Page...</h2>;
}

export default function App() {
  return (
    <div style={{ margin: '4rem' }}>
      <nav>
        <Link to="/">Home</Link> | <Link to="dashboard">Dashboard</Link> |{' '}
        <Link to="trending">Trends</Link> |
        <Link to="fno-filters">FNO filters</Link> |
        <Link to="fno-live">FNO Live</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} /> |
        <Route path="dashboard" element={<QuoteCard />} />
        <Route path="trending" element={<Trends />} />
        <Route path="fno-filters" element={<FnoFilters />} />
        <Route path="fno-live" element={<FnoLive />} />
      </Routes>
    </div>
  );
}
