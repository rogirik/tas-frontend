import React from 'react'

export default function WalkthroughReport({ selectedProductCode, selectedProductTitle, learnerProfile, strategyDetails, tasUnits, calculation, activeTasMeta }) {
  
  const getDigCompLabel = (val) => {
    const labels = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2', 7: 'D1', 8: 'D2' };
    return labels[val] || '0';
  }

  return (
    <div style={{ background: 'white', padding: '50px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #2b6cb0', paddingBottom: '25px', marginBottom: '35px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1a365d', fontSize: '2.5em' }}>Training & Assessment Strategy</h2>
        <p style={{ fontSize: '1.4em', color: '#4a5568', margin: 0 }}><strong>{selectedProductCode}</strong> — {selectedProductTitle}</p>
        
        {/* NEW: VERSION & TARGET COHORT DISPLAY */}
        <p style={{ fontSize: '1.1em', color: '#718096', margin: '15px 0 0 0', display: 'inline-block', background: '#edf2f7', padding: '6px 16px', borderRadius: '20px' }}>
          <strong>Target:</strong> {activeTasMeta?.name || 'Standard Delivery'} <span style={{ margin: '0 10px', color: '#cbd5e0' }}>|</span> <strong>Version:</strong> {activeTasMeta?.version || '1.0'}
        </p>
      </div>

      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#2d3748', marginTop: '40px' }}>1. Target Learner & Entry Requirements</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '0.95em' }}>
        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7' }}><strong style={{ display: 'block', color: '#4a5568', marginBottom: '5px' }}>Employment Status:</strong>{learnerProfile.employment_status || 'Not specified'}</div>
        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7' }}><strong style={{ display: 'block', color: '#4a5568', marginBottom: '5px' }}>Reason for Learning:</strong>{learnerProfile.reason_for_learning || 'Not specified'}</div>
        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7', gridColumn: 'span 2' }}><strong style={{ display: 'block', color: '#4a5568', marginBottom: '5px' }}>Industry Experience:</strong>{learnerProfile.industry_experience || 'Not specified'}</div>
      </div>

      <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #edf2f7', marginBottom: '20px' }}>
        <strong style={{ display: 'block', color: '#4a5568', marginBottom: '15px' }}>Minimum LLND Entry Requirements:</strong>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['learning', 'reading', 'writing', 'oral', 'numeracy'].map(skill => (
            <div key={skill} style={{ textAlign: 'center', background: 'white', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e0', flex: 1 }}>
              <div style={{ fontSize: '0.8em', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold', marginBottom: '5px' }}>{skill}</div>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2b6cb0' }}>{learnerProfile[`acsf_${skill}`] || '0'}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', background: 'white', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e0', flex: 1 }}>
            <div style={{ fontSize: '0.8em', textTransform: 'uppercase', color: '#718096', fontWeight: 'bold', marginBottom: '5px' }}>DIGITAL</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#38a169' }}>{getDigCompLabel(learnerProfile.acsf_digital)}</div>
          </div>
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#2d3748', marginTop: '40px' }}>2. Delivery Logistics & Rationale</h3>
      <div style={{ background: '#fff', padding: '0', fontSize: '0.95em', lineHeight: '1.6' }}>
        <p><strong>Delivery Logistics:</strong><br/>{strategyDetails.delivery_logistics || 'Not specified'}</p>
        <p><strong>Amount of Training Rationale (Cl 1.1 & 1.2):</strong><br/>{strategyDetails.training_rationale || 'Not specified'}</p>
      </div>

      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#2d3748', marginTop: '40px' }}>3. Unit Delivery Structure</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.95em' }}>
        <thead>
          <tr style={{ background: '#edf2f7', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e0' }}>Cluster</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e0' }}>Unit Code</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e0' }}>Vol of Learning</th>
          </tr>
        </thead>
        <tbody>
          {tasUnits.map((u, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: '12px', fontWeight: '600', color: '#2b6cb0' }}>{u.cluster_name}</td>
              <td style={{ padding: '12px', fontWeight: '600' }}>{u.unit_code}</td>
              <td style={{ padding: '12px' }}>{u.supervised_hours + u.unsupervised_hours}h</td>
            </tr>
          ))}
        </tbody>
      </table>
      {calculation && (
        <div style={{ padding: '15px', borderRadius: '8px', background: calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#f0fff4' : '#fff5f5', border: `1px solid ${calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#c6f6d5' : '#fed7d7'}` }}>
          <strong>AQF Compliance Status:</strong> {calculation.status}
        </div>
      )}

      <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#2d3748', marginTop: '40px' }}>4. Resources & Evaluation Strategy</h3>
      <div style={{ background: '#fff', padding: '0', fontSize: '0.95em', lineHeight: '1.6' }}>
        <p><strong>Resource Requirements:</strong><br/>{strategyDetails.resource_requirements || 'Not specified'}</p>
        <p><strong>Evaluation & Industry Consultation:</strong><br/>{strategyDetails.evaluation_strategy || 'Not specified'}</p>
      </div>
    </div>
  )
}