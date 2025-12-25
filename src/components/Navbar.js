import React from 'react';

const Navbar = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="nav">
      <div className="nav-links">
        <a
          href="#home"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('home');
          }}
        >
          Home
        </a>
        <a
          href="#rsvp"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('rsvp');
          }}
        >
          RSVP
        </a>
        <a
          href="#faq"
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('faq');
          }}
        >
          FAQ
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
