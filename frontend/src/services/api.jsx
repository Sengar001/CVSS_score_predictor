// src/services/api.js
const API_BASE = '/api';

// const API_BASE = import.meta.env.MODE === 'development' 
//   ? 'http://cvss-backend1:5000/api' 
//   : '/api';

export const predictCVSS = async (data) => {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const submitFeedback = async (data) => {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const retrainModel = async () => {
  const response = await fetch(`${API_BASE}/retrain`, {
    method: 'POST',
  });
  return response.json();
};

export const reloadModel = async () => {
  const response = await fetch(`${API_BASE}/reload`, {
    method: 'POST',
  });
  return response.json();
};