import React, { useState } from 'react'

export default function LearnerProfileTab({ activeTasId, learnerProfile, setLearnerProfile, handleSaveProfile }) {
  const [polishingState, setPolishingState] = useState({})

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit' }
  const labelStyle = { fontWeight: 'bold', color: '#4a5568' }

  const handlePolish = (field) => {
    if (!activeTasId) return
    const currentText = learnerProfile[field]
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
      setLearnerProfile(prev => ({ ...prev, [field]: data.generated_text }))
    })
    .catch(err => console.error("AI Generation failed:", err))
    .finally(() => {
      setPolishingState(prev => ({ ...prev, [field]: false }))
    })
  }

  // ACSF & DigComp logic (unchanged)
  const acsfSkills = ['learning', 'reading', 'writing', 'oral', 'numeracy']
  const acsfDescriptions = {
    0: "Select a level to view ACSF expectations.", 1: "Level 1: Works alongside an expert.", 2: "Level 2: Predictable contexts with support.", 3: "Level 3: Works independently.", 4: "Level 4: Unpredictable contexts.", 5: "Level 5: Autonomous learner."
  }
  const digCompLevels = [
    { val: 1, label: 'A1', desc: 'Foundation: Guidance' }, { val: 2, label: 'A2', desc: 'Foundation: Autonomy' }, { val: 3, label: 'B1', desc: 'Intermediate: Routine tasks' }, { val: 4, label: 'B2', desc: 'Intermediate: Problem solving' }, { val: 5, label: 'C1', desc: 'Advanced: Guiding others' }, { val: 6, label: 'C2', desc: 'Advanced: Resolving complex problems' }, { val: 7, label: 'D1', desc: 'Highly Specialised: Creating new solutions' }, { val: 8, label: 'D2', desc: 'Highly Specialised: Strategic' }
  ]

  return (
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>Target Learner & Entry Requirements</h3>
      <form onSubmit={handleSaveProfile}>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Employment Status:</label>
            <button type="button" onClick={() => handlePolish('employment_status')} disabled={polishingState['employment_status']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{polishingState['employment_status'] ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={learnerProfile.employment_status || ''} onChange={e => setLearnerProfile({...learnerProfile, employment_status: e.target.value})} rows="3" style={inputStyle} placeholder="Describe target learner employment backgrounds..." />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Reason for Learning:</label>
            <button type="button" onClick={() => handlePolish('reason_for_learning')} disabled={polishingState['reason_for_learning']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{polishingState['reason_for_learning'] ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={learnerProfile.reason_for_learning || ''} onChange={e => setLearnerProfile({...learnerProfile, reason_for_learning: e.target.value})} rows="3" style={inputStyle} placeholder="Describe motivations and goals..." />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={labelStyle}>Industry Experience:</label>
            <button type="button" onClick={() => handlePolish('industry_experience')} disabled={polishingState['industry_experience']} style={{ background: 'transparent', color: '#3182ce', border: '1px solid #3182ce', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}>{polishingState['industry_experience'] ? '⏳ Polishing...' : '✨ Polish Language'}</button>
          </div>
          <textarea value={learnerProfile.industry_experience || ''} onChange={e => setLearnerProfile({...learnerProfile, industry_experience: e.target.value})} rows="3" style={inputStyle} placeholder="Describe prior industry exposure..." />
        </div>

        <div style={{ marginBottom: '25px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#2d3748', fontSize: '1.1em' }}>LLND Requirements (ACSF & DigComp 3.0)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {acsfSkills.map(skill => (
              <div key={skill} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>
                <div style={{ width: '100px', fontWeight: 'bold', textTransform: 'capitalize', color: '#4a5568', marginTop: '10px' }}>{skill}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {[1, 2, 3, 4, 5].map(level => (
                      <button key={level} type="button" onClick={() => setLearnerProfile({...learnerProfile, [`acsf_${skill}`]: level})} style={{ width: '40px', height: '40px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', background: learnerProfile[`acsf_${skill}`] === level ? '#3182ce' : '#edf2f7', color: learnerProfile[`acsf_${skill}`] === level ? 'white' : '#4a5568', border: learnerProfile[`acsf_${skill}`] === level ? '2px solid #2b6cb0' : '1px solid #cbd5e0' }}>{level}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#2b6cb0', minHeight: '20px', fontStyle: 'italic' }}>{acsfDescriptions[learnerProfile[`acsf_${skill}`] || 0]}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', paddingTop: '10px' }}>
              <div style={{ width: '100px', fontWeight: 'bold', color: '#4a5568', marginTop: '10px' }}>Digital</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {digCompLevels.map(dc => (
                    <button key={dc.val} type="button" onClick={() => setLearnerProfile({...learnerProfile, acsf_digital: dc.val})} style={{ width: '40px', height: '40px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', background: learnerProfile.acsf_digital === dc.val ? '#38a169' : '#edf2f7', color: learnerProfile.acsf_digital === dc.val ? 'white' : '#4a5568', border: learnerProfile.acsf_digital === dc.val ? '2px solid #22543d' : '1px solid #cbd5e0' }}>{dc.label}</button>
                  ))}
                </div>
                <div style={{ fontSize: '0.85em', color: '#22543d', minHeight: '20px', fontStyle: 'italic' }}>{learnerProfile.acsf_digital ? digCompLevels.find(d => d.val === learnerProfile.acsf_digital).desc : "Select a DigComp 3.0 level."}</div>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Profile</button>
      </form>
    </div>
  )
}