import React from 'react'

export default function StatusHud({ calculation, tasUnits }) {
  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748', fontSize: '1.1em', marginBottom: '15px' }}>Live Strategy Overview</h3>
      
      {calculation && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2b6cb0' }}>{calculation.total_units}</div>
            <div style={{ color: '#718096', fontSize: '0.85em' }}>Total Units</div>
          </div>
          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2b6cb0' }}>{calculation.total_nominal_hours}h</div>
            <div style={{ color: '#718096', fontSize: '0.85em' }}>Nominal Hours</div>
          </div>
          <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2b6cb0' }}>{calculation.total_volume_of_learning}h</div>
            <div style={{ color: '#718096', fontSize: '0.85em' }}>Volume of Learning</div>
          </div>
          <div style={{ padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#f0fff4' : '#fff5f5', color: calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#22543d' : '#742a2a', border: `1px solid ${calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#c6f6d5' : '#fed7d7'}` }}>
            <strong style={{ fontSize: '0.9em', textAlign: 'center' }}>{calculation.status}</strong>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.85em', color: '#718096', fontWeight: 'bold', marginRight: '5px', alignSelf: 'center' }}>ATTACHED UNITS:</span>
        {tasUnits.length === 0 ? (
          <span style={{ fontSize: '0.85em', color: '#a0aec0', fontStyle: 'italic', alignSelf: 'center' }}>None selected yet</span>
        ) : (
          tasUnits.map((u, idx) => (
            <span key={idx} style={{ background: '#edf2f7', color: '#2d3748', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85em', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>
              {u.unit_code}
            </span>
          ))
        )}
      </div>
    </div>
  )
}