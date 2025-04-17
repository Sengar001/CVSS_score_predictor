import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

const FeedbackForm = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    cvss: initialData.cvss || initialData.cvss_score || 0,
    feedback_notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await submitFeedback(formData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="feedback-container">
        <div className="success-message">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
          <p>Thank you for your feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <h2>Provide Feedback</h2>
      <p>Help improve our model by providing the correct CVSS score if our prediction was inaccurate.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Actual CVSS Score</label>
          <input
            type="number"
            name="cvss"
            min="0"
            max="10"
            step="0.1"
            value={formData.cvss}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea
            name="feedback_notes"
            value={formData.feedback_notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button type="button" className="secondary" onClick={onSuccess}>
            Skip
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;