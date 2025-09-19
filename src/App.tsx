import React, { useState } from 'react';
import { Router, Link } from '@reach/router';
import QuoteCard from './components/QuoteCard';

function Home() {
  return <QuoteCard />;
}

function About() {
  return <h2>About Page</h2>;
}

function Dashboard() {
  return <h2>Contact Page</h2>;
}

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> <Link to="dashboard">Dashboard</Link>
      </nav>
      <Router>
        <Home path="/" />
        <Dashboard path="dashboard" />
      </Router>
    </div>
  );
}
