// src/App.jsx
import React, { useState } from 'react'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import ResultsDisplay from './components/ResultsDisplay'
import FeedbackForm from './components/FeedbackForm'
import ModelManagement from './components/ModelManagement'
import './App.css'

function App() {
  const [prediction, setPrediction] = useState(null)
  const [activeTab, setActiveTab] = useState('predict')
  const [feedbackData, setFeedbackData] = useState(null)

  return (
    <div className="app">
      <Header />
      
      <div className="tabs">
        <button 
          className={activeTab === 'predict' ? 'active' : ''} 
          onClick={() => setActiveTab('predict')}
        >
          Predict CVSS
        </button>
        <button 
          className={activeTab === 'manage' ? 'active' : ''} 
          onClick={() => setActiveTab('manage')}
        >
          Model Management
        </button>
      </div>

      <div className="content">
        {activeTab === 'predict' ? (
          <>
            <PredictionForm 
              setPrediction={setPrediction} 
              setFeedbackData={setFeedbackData}
            />
            {prediction && <ResultsDisplay prediction={prediction} />}
            {feedbackData && (
              <FeedbackForm 
                initialData={feedbackData} 
                onSuccess={() => setFeedbackData(null)}
              />
            )}
          </>
        ) : (
          <ModelManagement />
        )}
      </div>
    </div>
  )
}

export default App