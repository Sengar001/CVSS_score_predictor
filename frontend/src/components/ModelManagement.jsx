import React, { useState } from 'react';
import { retrainModel, reloadModel } from '../services/api';

const ModelManagement = () => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setMessage(null);
    setError(null);
    
    try {
      const result = await retrainModel();
      setMessage(result.status || 'Model retrained successfully');
    } catch (err) {
      setError('Failed to retrain model. Please try again.');
      console.error(err);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    setMessage(null);
    setError(null);
    
    try {
      const result = await reloadModel();
      setMessage(result.status || 'Model reloaded successfully');
    } catch (err) {
      setError('Failed to reload model. Please try again.');
      console.error(err);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="management-container">
      <h2>Model Management</h2>
      <p>Advanced options for managing the CVSS prediction model</p>
      
      <div className="management-actions">
        <div className="action-card">
          <h3>Retrain Model</h3>
          <p>Retrain the model with the latest feedback data (requires 500+ feedback entries).</p>
          <button 
            onClick={handleRetrain} 
            disabled={isRetraining}
          >
            {isRetraining ? 'Retraining...' : 'Retrain Model'}
          </button>
        </div>

        <div className="action-card">
          <h3>Reload Model</h3>
          <p>Reload the current model from disk without retraining.</p>
          <button 
            onClick={handleReload} 
            disabled={isReloading}
          >
            {isReloading ? 'Reloading...' : 'Reload Model'}
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="model-info">
        <h3>Model Information</h3>
        <p>This system uses a machine learning model to predict CVSS scores based on vulnerability descriptions and metadata.</p>
        <p>The model is periodically retrained with user feedback to improve accuracy.</p>
      </div>
    </div>
  );
};

export default ModelManagement;