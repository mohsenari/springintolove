import React, { useState } from 'react';

const RSVPWed = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: 1,
    attending: 'yes',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);

  // Predefined list of names for autocomplete
  const predefinedNames = [
    'Joan Gaylord',
    'Mohammed Franecki',
    'Tichomír Gocníková',
    'Kenzie',
    'Mary Charow & Andres Munevar',
    'Banafsheh Mehrazma',
    'Lucille',
    'Amir.Z',
    'Johanne Saintelus',
    'Oliver Kanter'
  ];

  // Guest number options
  const guestNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle autocomplete for name field
    if (name === 'name') {
      if (value.length > 0) {
        const filtered = predefinedNames.filter(n =>
          n.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredNames(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (name) => {
    setFormData({ ...formData, name });
    setShowSuggestions(false);
  };

  const handleGuestNumberClick = (num) => {
    setFormData({ ...formData, guests: num });
    setShowGuestSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.attending || !formData.guests) {
      setMessage({ text: 'Please fill out all required fields', type: 'error' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Thank you! Hope to see you at the wedding.', type: 'success' });
        setFormData({ name: '', email: '', guests: 1, attending: '' });
      } else {
        setMessage({ text: data.error || 'Something went wrong. Please try again.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="section rsvp">
      <div className="rose">
        <img src='images/rose2.svg' width={300} height={228} />
      </div>
      <div className="rsvp-form">
        <h2 className="form-title">RSVP</h2>
        <p className="form-description">
          Please search for you and your family members' names to provide your RSVP responses.
          If you have any questions check our <a id="faq-link" href="#faq" onClick={(e) => {
            e.preventDefault();
            scrollToSection('faq');
          }}
          >FAQ page
          </a> or message Liz at 647-389-9581
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group suggestions-container">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Your Name"
              autoComplete="off"
            />
            {showSuggestions && filteredNames.length > 0 && (
              <ul className="suggestions-list">
                {filteredNames.map((name, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(name)}
                    className="suggestion-item"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group suggestions-container">
            <label htmlFor="guests" className="form-label">Number of Guests</label>
            <input
              type="text"
              id="guests"
              name="guests"
              value={formData.guests || ''}
              onChange={handleChange}
              onFocus={() => setShowGuestSuggestions(true)}
              className="form-input"
              placeholder="1"
              autoComplete="off"
            />
            {showGuestSuggestions && (
              <ul className="suggestions-list">
                {guestNumbers.map((num) => (
                  <li
                    key={num}
                    onClick={() => handleGuestNumberClick(num)}
                    className="suggestion-item"
                  >
                    {num}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Your Email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">We are attending</label>
            <div className="toggle-container">
              <input
                type="radio"
                id="yes"
                name="attending"
                value="yes"
                checked={formData.attending === 'yes'}
                onChange={handleChange}
              />
              <input
                type="radio"
                id="no"
                name="attending"
                value="no"
                checked={formData.attending === 'no'}
                onChange={handleChange}
              />
              <label
                htmlFor="yes"
                className={`toggle-label ${formData.attending === 'yes' ? 'active' : ''}`}
              >
                Yes
              </label>
              <label
                htmlFor="no"
                className={`toggle-label ${formData.attending === 'no' ? 'active' : ''}`}
              >
                No
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </form>

        {message.text && (
          <p className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </p>
        )}
      </div>
    </section >
  );
};

export default RSVPWed;
