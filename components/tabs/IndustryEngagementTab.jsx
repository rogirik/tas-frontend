import React from 'react';

export default function IndustryEngagementTab({ activeTasId, tasUnits, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  if (!activeTasId) return <div style={{ padding: '20px' }}>No TAS ID provided. Please open a TAS first.</div>;

  const engagements = strategyDetails.industry_engagements || [];

  // Generate a dynamic list of linkable TAS areas based on the current active TAS
  const uniqueClusters = [...new Set((tasUnits || []).map(u => u.cluster_name || "Standalone"))];
  const linkableAreas = [
    "Global: Delivery & Resources",
    "Global: Learner Profile",
    "Global: Evaluation Plan",
    ...uniqueClusters.map(c => `Cluster: ${c}`)
  ];

  // Helper to update a specific engagement index
  const updateEngagement = (index, field, value) => {
    const updatedEngagements = [...engagements];
    updatedEngagements[index] = {
      ...updatedEngagements[index],
      [field]: value
    };
    setStrategyDetails(prev => ({ ...prev, industry_engagements: updatedEngagements }));
  };

  const handleToggleLink = (engagementIndex, area) => {
    const currentLinks = engagements[engagementIndex].linked_items || [];
    const newLinks = currentLinks.includes(area)
      ? currentLinks.filter(item => item !== area)
      : [...currentLinks, area];
    
    updateEngagement(engagementIndex, 'linked_items', newLinks);
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', marginTop: '6px', fontFamily: 'inherit' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>
        <div>
          <h2 style={{ marginTop: 0, color: '#1a365d', marginBottom: '5px' }}>Industry Engagement Matrix</h2>
          <p style={{ color: '#718096', margin: 0, fontSize: '0.9em' }}>Map received feedback to specific TAS clusters or logistics, and document your strategic adjustments.</p>
        </div>
        <button 
          onClick={() => {
            // Manual Add Stub for testing/offline entry
            const newPartner = { partner_name: 'New Partner', partner_email: '', status: 'Draft', answers: {}, linked_items: [], action_taken: '' };
            setStrategyDetails(prev => ({ ...prev, industry_engagements: [...engagements, newPartner] }));
          }}
          style={{ background: '#edf2f7', color: '#4a5568', border: '1px solid #cbd5e0', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Manual Entry
        </button>
      </div>

      {engagements.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', background: '#f7fafc', borderRadius: '8px', border: '1px dashed #cbd5e0', color: '#718096' }}>
          No industry feedback logged yet. Use the public link to request feedback.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {engagements.map((eng, index) => (
            <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              
              {/* Card Header */}
              <div style={{ background: '#f7fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <input 
                    style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2b6cb0', border: 'none', background: 'transparent', padding: 0, outline: 'none' }}
                    value={eng.partner_name || ''}
                    onChange={(e) => updateEngagement(index, 'partner_name', e.target.value)}
                    placeholder="Partner Name"
                  />
                  <div style={{ fontSize: '0.85em', color: '#718096', marginTop: '2px' }}>{eng.partner_email || 'No email provided'} | Status: {eng.status || 'Draft'}</div>
                </div>
                {eng.date && <div style={{ fontSize: '0.85em', color: '#a0aec0' }}>Logged: {eng.date}</div>}
              </div>

              {/* Feedback Content */}
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Left Column: The Feedback */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#4a5568', fontSize: '0.95em', textTransform: 'uppercase' }}>Received Feedback</h4>
                  {eng.answers && Object.keys(eng.answers).length > 0 ? (
                    <div style={{ background: '#edf2f7', padding: '15px', borderRadius: '6px', fontSize: '0.9em', color: '#2d3748' }}>
                      {Object.entries(eng.answers).map(([q, a]) => (
                        <div key={q} style={{ marginBottom: '10px' }}>
                          <strong style={{ display: 'block', color: '#4a5568' }}>{q.toUpperCase()}:</strong>
                          {a || <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>No response</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '6px', fontSize: '0.9em', color: '#c53030' }}>
                      Pending response from partner.
                    </div>
                  )}
                </div>

                {/* Right Column: The Strategy Mapping */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#4a5568', fontSize: '0.95em', textTransform: 'uppercase' }}>Strategy Mapping</h4>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'block', fontSize: '0.85em', color: '#718096', marginBottom: '8px' }}>Link to TAS Items:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {linkableAreas.map(area => {
                        const isLinked = (eng.linked_items || []).includes(area);
                        return (
                          <button
                            key={area}
                            onClick={() => handleToggleLink(index, area)}
                            style={{
                              padding: '4px 10px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 'bold', cursor: 'pointer', border: '1px solid',
                              background: isLinked ? '#ebf8ff' : '#f7fafc',
                              color: isLinked ? '#3182ce' : '#a0aec0',
                              borderColor: isLinked ? '#90cdf4' : '#e2e8f0',
                            }}
                          >
                            {isLinked ? '✓ ' : '+ '}{area}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85em', color: '#718096', marginBottom: '8px' }}>Action Taken / Adjustments Made:</strong>
                    <textarea 
                      style={{ ...inputStyle, minHeight: '80px', marginTop: 0 }}
                      value={eng.action_taken || ''}
                      onChange={(e) => updateEngagement(index, 'action_taken', e.target.value)}
                      placeholder="e.g. Based on this feedback, we added Xero software access to Cluster 2's resource requirements."
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
        <button 
          onClick={handleSaveDetails}
          style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05em' }}
        >
          Save Industry Matrix
        </button>
      </div>
    </div>
  );
}