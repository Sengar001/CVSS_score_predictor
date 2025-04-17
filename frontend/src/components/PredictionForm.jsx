import React, { useState } from 'react';
import { predictCVSS } from '../services/api';

const PredictionForm = ({ setPrediction, setFeedbackData }) => {
  const [formData, setFormData] = useState({
    summary: '',
    access_complexity: 'MEDIUM',
    impact_availability: 'PARTIAL',
    impact_confidentiality: 'PARTIAL',
    impact_integrity: 'PARTIAL',
    access_vector: 'NETWORK',
    access_authentication: 'NONE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const transformFormDataForBackend = (data) => {
    // Convert string values to numeric values as expected by backend
    const complexityMap = { 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
    const impactAvail = { 'NONE': 0, 'PARTIAL': 2, 'COMPLETE': 1 };
    const impactConf = { 'NONE': 1, 'PARTIAL': 2, 'COMPLETE': 0 };
    const impactInteg = { 'NONE': 0, 'PARTIAL': 2, 'COMPLETE': 1 };
    
    // Convert categorical variables to one-hot encoded format
    const vectorMap = {
      'NETWORK': [0, 0, 1],
      'ADJACENT_NETWORK': [0, 1, 0],
      'LOCAL': [1, 0, 0]
    };
    
    const authMap = {
      'NONE': [1, 0, 0],
      'SINGLE': [0, 1, 0],
      'MULTIPLE': [0, 0, 1]
    };

    return {
      "summary": "data.summary",
      "access_complexity": complexityMap[data.access_complexity],
      "impact_availability": impactAvail[data.impact_availability],
      "impact_confidentiality": impactConf[data.impact_confidentiality],
      "impact_integrity": impactInteg[data.impact_integrity],
      "access_vector_ADJACENT_NETWORK": vectorMap[data.access_vector][1],
      "access_vector_LOCAL": vectorMap[data.access_vector][0],
      "access_vector_NETWORK": vectorMap[data.access_vector][2],
      "access_authentication_MULTIPLE": authMap[data.access_authentication][2],
      "access_authentication_NONE": authMap[data.access_authentication][0],
      "access_authentication_SINGLE": authMap[data.access_authentication][1]
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Transform the form data before sending to backend
      const backendData = transformFormDataForBackend(formData);
      const result = await predictCVSS(backendData);
      
      setPrediction(result);
      setFeedbackData({
        ...formData, // Keep original form data for feedback display
        cvss: result.cvss_score,
        cwe_name: 'Unknown',
        cwe_code: '0',
      });
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Vulnerability Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vulnerability Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Access Vector</label>
            <select
              name="access_vector"
              value={formData.access_vector}
              onChange={handleChange}
            >
              <option value="NETWORK">Network</option>
              <option value="ADJACENT_NETWORK">Adjacent Network</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>

          <div className="form-group">
            <label>Access Complexity</label>
            <select
              name="access_complexity"
              value={formData.access_complexity}
              onChange={handleChange}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Authentication</label>
            <select
              name="access_authentication"
              value={formData.access_authentication}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="SINGLE">Single</option>
              <option value="MULTIPLE">Multiple</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Confidentiality Impact</label>
            <select
              name="impact_confidentiality"
              value={formData.impact_confidentiality}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="PARTIAL">Partial</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>

          <div className="form-group">
            <label>Integrity Impact</label>
            <select
              name="impact_integrity"
              value={formData.impact_integrity}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="PARTIAL">Partial</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>

          <div className="form-group">
            <label>Availability Impact</label>
            <select
              name="impact_availability"
              value={formData.impact_availability}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="PARTIAL">Partial</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict CVSS Score'}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;