import React, { useState } from 'react'

export default function LogisticsTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  const [polishingState, setPolishingState] = useState({})

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit', textAlign: 'left' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' }

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
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>Training Delivery & Student Support</h3>
      <form onSubmit={handleSaveDetails}>
        
        <div style={{ marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          
          {/* Logistics Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={labelStyle}>High-Level Delivery Logistics:</label>
              <button type="button" onClick={() => handlePolish('delivery_logistics')} disabled={polishingState['delivery_logistics']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                {polishingState['delivery_logistics'] ? '⏳ Polishing...' : '✨ Polish Language'}
              </button>
            </div>
            <textarea 
              value={strategyDetails.delivery_logistics || ''} 
              onChange={e => setStrategyDetails({...strategyDetails, delivery_logistics: e.target.value})} 
              rows="3" 
              style={inputStyle} 
              placeholder="e.g. Delivered face-to-face over 12 months at the main campus..." 
            />
          </div>

          {/* Delivery Methods Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={labelStyle}>Training Delivery Methods:</label>
              <button type="button" onClick={() => handlePolish('delivery_methods')} disabled={polishingState['delivery_methods']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                {polishingState['delivery_methods'] ? '⏳ Polishing...' : '✨ Polish Language'}
              </button>
            </div>
            <textarea 
              value={strategyDetails.delivery_methods || ''} 
              onChange={e => setStrategyDetails({...strategyDetails, delivery_methods: e.target.value})} 
              rows="4" 
              style={inputStyle} 
              placeholder="Describe how the training will be conducted (e.g. practical workshops, simulated environments, self-paced online modules, work placements)..." 
            />
          </div>

          {/* Special Requirements Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={labelStyle}>Special & Entry Requirements:</label>
              <button type="button" onClick={() => handlePolish('special_requirements')} disabled={polishingState['special_requirements']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                {polishingState['special_requirements'] ? '⏳ Polishing...' : '✨ Polish Language'}
              </button>
            </div>
            <textarea 
              value={strategyDetails.special_requirements || ''} 
              onChange={e => setStrategyDetails({...strategyDetails, special_requirements: e.target.value})} 
              rows="3" 
              style={inputStyle} 
              placeholder="List any prerequisites, required PPE, physical fitness requirements, or BYOD (laptop) policies..." 
            />
          </div>

          {/* Student Support Section */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={labelStyle}>Student Support & Reasonable Adjustment (Clause 1.7):</label>
              <button type="button" onClick={() => handlePolish('student_support')} disabled={polishingState['student_support']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
                {polishingState['student_support'] ? '⏳ Polishing...' : '✨ Polish Language'}
              </button>
            </div>
            <textarea 
              value={strategyDetails.student_support || ''} 
              onChange={e => setStrategyDetails({...strategyDetails, student_support: e.target.value})} 
              rows="4" 
              style={inputStyle} 
              placeholder="Detail how you will identify support needs, provide LLND assistance, and implement reasonable adjustments for assessment..." 
            />
          </div>

        </div>

        {/* Rationale Section */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Amount of Training Rationale (Clauses 1.1 & 1.2):</label>
            <button type="button" onClick={() => handlePolish('training_rationale')} disabled={polishingState['training_rationale']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>
              {polishingState['training_rationale'] ? '⏳ Polishing...' : '✨ Polish Language'}
            </button>
          </div>
          <textarea 
            value={strategyDetails.training_rationale || ''} 
            onChange={e => setStrategyDetails({...strategyDetails, training_rationale: e.target.value})} 
            rows="6" 
            style={inputStyle} 
            placeholder="Justify why this volume of learning and delivery structure is appropriate for your target learner cohort..." 
          />
        </div>

        <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Delivery Details</button>
      </form>
    </div>
  )
}