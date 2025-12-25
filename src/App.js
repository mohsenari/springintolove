import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RSVPWed from './components/RSVP_WED';
import FAQ from './components/faq';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Home />
      <RSVPWed />
      <FAQ />
    </div>
  );
}

export default App;
