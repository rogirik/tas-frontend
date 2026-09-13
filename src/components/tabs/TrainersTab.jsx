import React, { useState } from 'react'

export default function TrainersTab({ activeTasId, tasUnits, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [newTrainerName, setNewTrainerName] = useState('')
  
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit', textAlign: 'left' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' }

  // Safely parse the allocations dictionary to handle our new nested structure
  const allocationsData = strategyDetails.trainer_allocations || {}
  const trainers = Array.isArray(allocationsData.trainers) ? allocationsData.trainers : []
  const mapping = allocationsData.mapping || {}

  const handleAddTrainer = (e) => {
    e.preventDefault()
    if (!newTrainerName.trim()) return
    if (trainers.includes(newTrainerName.trim())) {
      setNewTrainerName('')
      return
    }
    
    setStrategyDetails(prev => ({
      ...prev,
      trainer_allocations: {
        trainers: [...trainers, newTrainerName.trim()],
        mapping: mapping
      }
    }))
    setNewTrainerName('')
  }

  const handleRemoveTrainer = (trainerToRemove) => {
    const updatedTrainers = trainers.filter(t => t !== trainerToRemove)
    const updatedMapping = {}
    
    // Remove the trainer from all unit mappings
    Object.keys(mapping).forEach(unitCode => {
      updatedMapping[unitCode] = mapping[unitCode].filter(t => t !== trainerToRemove)
    })
    
    setStrategyDetails(prev => ({
      ...prev,
      trainer_allocations: { trainers: updatedTrainers, mapping: updatedMapping }
    }))
  }

  const handleCheckboxChange = (unitCode, trainerName) => {
    const currentAssigned = mapping[unitCode] || []
    const isAssigned = currentAssigned.includes(trainerName)
    
    const newAssigned = isAssigned 
      ? currentAssigned.filter(t => t !== trainerName) 
      : [...currentAssigned, trainerName]

    setStrategyDetails(prev => ({
      ...prev,
      trainer_allocations: {
        trainers: trainers,
        mapping: { ...mapping, [unitCode]: newAssigned }
      }
    }))
  }

  const handlePolish = () => {
    if (!activeTasId) return
    const currentText = strategyDetails.trainer_requirements
    if (!currentText || currentText.trim() === '') {
      alert("Please write some rough notes first before polishing!")
      return
    }

    setIsPolishing(true)

    fetch(`http://127.0.0.1:8000/tas/${activeTasId}/polish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name: 'trainer_requirements', current_text: currentText })
    })
    .then(res => res.json())
    .then(data => {
      setStrategyDetails(prev => ({ ...prev, trainer_requirements: data.generated_text }))
    })
    .catch(err => console.error("AI Generation failed:", err))
    .finally(() => setIsPolishing(false))
  }

  return (
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>Trainer Allocation & Requirements</h3>
      
      <div style={{ marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
        <label style={labelStyle}>Add Trainer to Roster:</label>
        <form onSubmit={handleAddTrainer} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="e.g. Jane Smith" 
            value={newTrainerName} 
            onChange={(e) => setNewTrainerName(e.target.value)} 
            style={{ ...inputStyle, padding: '10px' }} 
          />
          <button type="submit" style={{ background: '#3182ce', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            + Add Trainer
          </button>
        </form>

        <label style={labelStyle}>Unit Allocation Matrix:</label>
        {tasUnits.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic', marginTop: '10px' }}>No units added to this TAS yet. Go back to the Unit Matrix tab to add units.</p>
        ) : trainers.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic', marginTop: '10px' }}>Add a trainer above to build the allocation matrix.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '15px', border: '1px solid #edf2f7', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#edf2f7' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e0', borderRight: '2px solid #cbd5e0', position: 'sticky', left: 0, background: '#edf2f7', zIndex: 2, minWidth: '150px' }}>Trainer Name</th>
                  {tasUnits.map((u, idx) => (
                    <th key={idx} title={u.unit_title} style={{ padding: '12px', borderBottom: '2px solid #cbd5e0', borderRight: '1px solid #edf2f7', fontSize: '0.85em', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {u.unit_code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer, tIdx) => (
                  <tr key={tIdx} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#2d3748', borderRight: '2px solid #cbd5e0', position: 'sticky', left: 0, background: '#fff', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {trainer}
                      <button type="button" onClick={() => handleRemoveTrainer(trainer)} style={{ background: 'transparent', color: '#fc8181', border: 'none', cursor: 'pointer', fontSize: '1.2em' }} title="Remove Trainer">×</button>
                    </td>
                    {tasUnits.map((u, uIdx) => {
                      const isAssigned = (mapping[u.unit_code] || []).includes(trainer)
                      return (
                        <td key={uIdx} style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #edf2f7', background: isAssigned ? '#ebf8ff' : '#fff' }}>
                          <input 
                            type="checkbox" 
                            checked={isAssigned}
                            onChange={() => handleCheckboxChange(u.unit_code, trainer)}
                            style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveDetails}>
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Trainer Requirements & Compliance Rationale (TAE & Industry Currency):</label>
            <button type="button" onClick={handlePolish} disabled={isPolishing} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{isPolishing ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea 
            value={strategyDetails.trainer_requirements || ''} 
            onChange={e => setStrategyDetails({...strategyDetails, trainer_requirements: e.target.value})} 
            rows="5" 
            style={inputStyle} 
            placeholder="Describe the vocational competencies, industry currency, and TAE requirements required for trainers delivering this course..." 
          />
        </div>
        <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Trainer Allocations</button>
      </form>
    </div>
  )
}