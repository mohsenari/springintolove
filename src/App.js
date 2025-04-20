import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RSVP from './components/RSVP';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Home />
      <RSVP />
    </div>
  );
}

export default App;
