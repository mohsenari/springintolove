import React, { useState } from 'react';

const RSVP = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name) {
      setMessage({ text: 'Please fill out all required fields', type: 'error' });
      return;
    }

    if (!formData.email && !formData.address) {
      setMessage({ text: 'Please put either email or mailing address', type: 'error' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email) && formData.address === "") {
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
        setMessage({ text: 'Thank you! We\'ll send you an invitation later this year.', type: 'success' });
        setFormData({ name: '', email: '' });
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
        <h2 className="form-title">Save the Date</h2>
        <p className="form-description">Please provide your email or mailing address to receive an invite.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Your Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Mailing Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Your mailing address"
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
    </section>
  );
};

export default RSVP;
