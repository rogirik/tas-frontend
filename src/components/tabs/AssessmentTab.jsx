import React, { useState } from 'react'

export default function AssessmentTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  const [isPolishing, setIsPolishing] = useState(false)
  
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit', textAlign: 'left' }
  const labelStyle = { fontWeight: 'bold', color: '#4a5568' }

  const methods = [
    { id: 'observation', label: 'Observation / Demonstration', desc: 'Direct observation of the student performing tasks in a real or simulated workplace.' },
    { id: 'questioning', label: 'Questioning (Written/Verbal)', desc: 'Knowledge tests, short answer questions, or verbal interviews.' },
    { id: 'portfolio', label: 'Project / Portfolio', desc: 'A compilation of workplace documents, project work, or ongoing assignments.' },
    { id: 'third_party', label: 'Third-Party Report', desc: 'Evidence and feedback collected from a workplace supervisor or manager.' },
    { id: 'role_play', label: 'Role-Play / Simulation', desc: 'Simulated workplace interactions to demonstrate communication or procedural skills.' },
    { id: 'case_study', label: 'Case Study / Scenario', desc: 'Analysis of a specific scenario to demonstrate problem-solving and knowledge application.' }
  ];

  const handleCheckboxChange = (id) => {
    const currentMethods = strategyDetails.assessment_methods || [];
    if (currentMethods.includes(id)) {
      setStrategyDetails({ ...strategyDetails, assessment_methods: currentMethods.filter(m => m !== id) });
    } else {
      setStrategyDetails({ ...strategyDetails, assessment_methods: [...currentMethods, id] });
    }
  }

  const handlePolish = () => {
    if (!activeTasId) return
    const currentText = strategyDetails.assessment_rationale
    if (!currentText || currentText.trim() === '') {
      alert("Please write some rough notes first before polishing!")
      return
    }

    setIsPolishing(true)

    fetch(`http://127.0.0.1:8000/tas/${activeTasId}/polish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name: 'assessment_rationale', current_text: currentText })
    })
    .then(res => res.json())
    .then(data => {
      setStrategyDetails(prev => ({ ...prev, assessment_rationale: data.generated_text }))
    })
    .catch(err => console.error("AI Generation failed:", err))
    .finally(() => {
      setIsPolishing(false)
    })
  }

  return (
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748', textAlign: 'left' }}>Assessment Methods & Rationale</h3>
      <form onSubmit={handleSaveDetails}>
        
        <div style={{ marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568', textAlign: 'left' }}>Select Assessment Methods:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '15px' }}>
            {methods.map(method => {
              const isChecked = (strategyDetails.assessment_methods || []).includes(method.id);
              return (
                <label key={method.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', cursor: 'pointer', padding: '15px', border: isChecked ? '2px solid #3182ce' : '1px solid #edf2f7', borderRadius: '8px', background: isChecked ? '#ebf8ff' : '#fff', transition: 'all 0.2s', textAlign: 'left' }}>
                  <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(method.id)} style={{ marginTop: '4px', transform: 'scale(1.3)', cursor: 'pointer' }} />
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: isChecked ? '#2b6cb0' : '#4a5568', display: 'block', marginBottom: '4px', fontSize: '1.05em' }}>{method.label}</strong>
                    <span style={{ fontSize: '0.85em', color: '#718096', lineHeight: '1.4', display: 'block' }}>{method.desc}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Assessment Rationale:</label>
            <button type="button" onClick={handlePolish} disabled={isPolishing} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{isPolishing ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={strategyDetails.assessment_rationale || ''} onChange={e => setStrategyDetails({...strategyDetails, assessment_rationale: e.target.value})} rows="5" style={inputStyle} placeholder="Justify why these assessment methods are appropriate..." />
        </div>

        <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Assessment Strategy</button>
      </form>
    </div>
  )
}