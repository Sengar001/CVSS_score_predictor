// src/services/api.js
const API_BASE = 'http://cvss-backend:5000/api';

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