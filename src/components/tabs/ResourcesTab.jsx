import React, { useState } from 'react'

export default function ResourcesTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  const [polishingState, setPolishingState] = useState({})

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit' }
  const labelStyle = { fontWeight: 'bold', color: '#4a5568' }

  const handlePolish = (field) => {
    if (!activeTasId) return
    const currentText = strategyDetails[field]
    if (!currentText || currentText.trim() === '') {
      alert("Please write some rough notes first before polishing!")
      return
    }

    setPolishingState(prev => ({ ...prev, [field]: true }))

    fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/tas/${activeTasId}/polish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name: field, current_text: currentText })
    })
    .then(res => res.json())
    .then(data => {
      setStrategyDetails(prev => ({ ...prev, [field]: data.generated_text }))
    })
    .catch(err => console.error("AI Generation failed:", err))
    .finally(() => {
      setPolishingState(prev => ({ ...prev, [field]: false }))
    })
  }

  return (
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>Resources & Evaluation Strategy</h3>
      <form onSubmit={handleSaveDetails}>
        
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Resource Requirements (Trainers, Facilities, Equipment):</label>
            <button type="button" onClick={() => handlePolish('resource_requirements')} disabled={polishingState['resource_requirements']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{polishingState['resource_requirements'] ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={strategyDetails.resource_requirements || ''} onChange={e => setStrategyDetails({...strategyDetails, resource_requirements: e.target.value})} rows="6" style={inputStyle} placeholder="List required facilities, equipment, and trainer competencies..." />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Evaluation Strategy & Industry Consultation:</label>
            <button type="button" onClick={() => handlePolish('evaluation_strategy')} disabled={polishingState['evaluation_strategy']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{polishingState['evaluation_strategy'] ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={strategyDetails.evaluation_strategy || ''} onChange={e => setStrategyDetails({...strategyDetails, evaluation_strategy: e.target.value})} rows="6" style={inputStyle} placeholder="Detail how the strategy is evaluated and industry is consulted..." />
        </div>

        <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Resources & Evaluation</button>
      </form>
    </div>
  )
}