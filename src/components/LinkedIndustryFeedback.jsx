import React from 'react';

export default function LinkedIndustryFeedback({ engagements, targetArea }) {
  if (!engagements || !Array.isArray(engagements)) return null;

  // Find all feedback that has been tagged to this specific tab/cluster
  const relevantFeedback = engagements.filter(eng => 
    eng.linked_items && eng.linked_items.includes(targetArea)
  );

  if (relevantFeedback.length === 0) {
    return (
      <div style={{ marginTop: '30px', padding: '15px', background: '#f7fafc', border: '1px dashed #cbd5e0', borderRadius: '8px', color: '#718096', fontSize: '0.9em', textAlign: 'center' }}>
        No industry feedback is currently linked to this section. You can map feedback to <strong>{targetArea}</strong> from the Industry tab.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '40px', background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', padding: '25px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#276749', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2em' }}>
        🤝 Industry Endorsed Strategy
      </h3>
      <p style={{ fontSize: '0.9em', color: '#2f855a', marginBottom: '25px', marginTop: 0 }}>
        The strategies above have been directly shaped by the following industry consultations, demonstrating clear alignment with workplace expectations.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {relevantFeedback.map((eng, idx) => (
          <div key={idx} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #c6f6d5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
              <strong style={{ color: '#276749', fontSize: '1.1em' }}>{eng.partner_name || 'Unnamed Partner'}</strong>
              <span style={{ fontSize: '0.85em', color: '#718096' }}>{eng.date || 'Recent'}</span>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ display: 'block', fontSize: '0.85em', color: '#718096', textTransform: 'uppercase', marginBottom: '5px' }}>Industry Feedback:</strong>
              <div style={{ fontSize: '0.95em', color: '#4a5568', background: '#f7fafc', padding: '12px', borderRadius: '6px', fontStyle: 'italic', border: '1px solid #edf2f7' }}>
                "{Object.values(eng.answers || {}).filter(a => a).join(" | ") || "Feedback incorporated."}"
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.85em', color: '#718096', textTransform: 'uppercase', marginBottom: '5px' }}>How this meets expectations (Action Taken):</strong>
              <div style={{ fontSize: '0.95em', color: '#2b6cb0', background: '#ebf8ff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #3182ce' }}>
                {eng.action_taken || "Strategy aligned with expectations."}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}