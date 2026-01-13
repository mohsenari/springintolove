import React, { useState } from 'react';
import names from './names';

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
  const [selectedNames, setSelectedNames] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle autocomplete for name field
    if (name === 'name') {
      if (value.length > 0) {
        const filtered = names.filter(n =>
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
    setSelectedNames([...selectedNames, name]);
    setFormData({ ...formData, name: '' });
    setShowSuggestions(false);
  };

  const removeSelectedName = (indexToRemove) => {
    setSelectedNames(selectedNames.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Concatenate selected names
    const concatenatedNames = selectedNames.join(', ');

    // Basic validation
    if (!concatenatedNames || !formData.email || !formData.attending || !formData.guests) {
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

    // Create submission data with concatenated names
    const submissionData = {
      ...formData,
      name: concatenatedNames,
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        let successMessage = '';
        if (formData.attending === "yes") {
          successMessage = 'Thank you! Looking forward to seeing you at the wedding.';
        } else if (formData.attending === "no") {
          successMessage = 'Thank you for your response. We will miss you.';
        }
        setMessage({ text: successMessage, type: 'success' });
        setPopupMessage({ text: successMessage, type: 'success' });
        setShowPopup(true);
        setFormData({ name: '', email: '', guests: 1, attending: '' });
        setSelectedNames([]);
      } else {
        const errorMessage = data.error || 'Something went wrong. Please try again.';
        setMessage({ text: errorMessage, type: 'error' });
        setPopupMessage({ text: errorMessage, type: 'error' });
        setShowPopup(true);
      }
    } catch (error) {
      const errorMessage = 'Something went wrong. Please try again.';
      setMessage({ text: errorMessage, type: 'error' });
      setPopupMessage({ text: errorMessage, type: 'error' });
      setShowPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="section rsvp">
      {showPopup && (
        <div className="popup-overlay">
          <div className={`popup-content ${popupMessage.type}`}>
            <p>{popupMessage.text}</p>
            <button onClick={() => setShowPopup(false)} className="popup-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
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
          </a> or message Liz (Emily) at 647-389-9581
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group suggestions-container">
            <label htmlFor="name" className="form-label">Add Name(s)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Guest Name"
                autoComplete="off"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.name.trim()) {
                    handleSuggestionClick(formData.name.trim());
                  }
                }}
                className="add-name-btn"
              >
                +
              </button>
            </div>
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
            {selectedNames.length > 0 && (
              <div className="selected-names">
                {selectedNames.map((name, index) => (
                  <div key={index} className="selected-name-tag">
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedName(index)}
                      className="remove-name-btn"
                    >
                      <span className='selected-name-tag-x'>x</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="guests" className="form-label">Number of Guests</label>
            <input
              type="text"
              id="guests"
              name="guests"
              value={selectedNames.length}
              readOnly
              className="form-input"
              placeholder="0"
            />
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
