import React from 'react';

const ResultsDisplay = ({ prediction }) => {
  const getSeverity = (score) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    if (score > 0.0) return 'Low';
    return 'None';
  };

  const severity = getSeverity(prediction.cvss_score);
  const severityClass = severity.toLowerCase();

  return (
    <div className="results-container">
      <h2>Prediction Results</h2>
      <div className={`severity-indicator ${severityClass}`}>
        <div className="score-circle">
          <span>{prediction.cvss_score}</span>
        </div>
        <div className="severity-label">{severity}</div>
      </div>
      
      <div className="severity-description">
        {severity === 'Critical' && (
          <p>This vulnerability is extremely dangerous and should be addressed immediately.</p>
        )}
        {severity === 'High' && (
          <p>This vulnerability poses significant risk and should be prioritized for remediation.</p>
        )}
        {severity === 'Medium' && (
          <p>This vulnerability should be addressed in a timely manner.</p>
        )}
        {severity === 'Low' && (
          <p>This vulnerability has minimal impact but should still be addressed.</p>
        )}
        {severity === 'None' && (
          <p>This vulnerability has no impact.</p>
        )}
      </div>
    </div>
  );
};
// abhishek
export default ResultsDisplay;