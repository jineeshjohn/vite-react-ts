import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import QuoteCard from './components/QuoteCard';
import GapFinder from './components/GapFinder';

function Home() {
  return <GapFinder />;
}

function About() {
  return <h2>About Page</h2>;
}

function Dashboard() {
  return <QuoteCard />;
}

export default function App() {
  return (
    <div style={{ margin: '4rem' }}>
      <nav>
        <Link to="/">Home</Link>
        <Link to="dashboard">Dashboard</Link>
      </nav>
      <Router>
        <Home path="/" />
        <Dashboard path="dashboard" />
      </Router>
    </div>
  );
}
