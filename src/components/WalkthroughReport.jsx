import React, { useState, useEffect } from 'react';

export default function WalkthroughReport({ activeTasId, activeTasMeta, selectedProductCode, selectedProductTitle, learnerProfile, strategyDetails, tasUnits, calculation }) {
  const API_URL = "http://localhost:8000";
  const [clusterStrategies, setClusterStrategies] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(true);

  useEffect(() => {
    if (!activeTasId) return;
    fetch(`${API_URL}/tas/${activeTasId}/cluster_strategies`)
      .then(res => res.json())
      .then(data => {
        setClusterStrategies(data || []);
        setLoadingStrategies(false);
      })
      .catch(err => {
        console.error("Error fetching walkthrough strategies:", err);
        setLoadingStrategies(false);
      });
  }, [activeTasId]);

  // Group tasUnits by their cluster_name for a clean breakdown
  const groupedUnits = {};
  (tasUnits || []).forEach(u => {
    const cName = u.cluster_name || "Standalone";
    if (!groupedUnits[cName]) groupedUnits[cName] = [];
    groupedUnits[cName].push(u);
  });

  const cardStyle = { background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  const headingStyle = { color: '#1a365d', borderBottom: '2px solid #edf2f7', paddingBottom: '10px', marginTop: 0, marginBottom: '20px', fontSize: '1.2em' };
  const labelStyle = { fontWeight: 'bold', color: '#4a5568', display: 'block', marginBottom: '5px' };
  const textStyle = { color: '#2d3748', whiteSpace: 'pre-wrap', lineHeight: '1.5', margin: 0 };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* Report Banner */}
      <div style={{ background: '#1a365d', color: 'white', padding: '30px', borderRadius: '10px', marginBottom: '30px' }}>
        <span style={{ background: '#3182ce', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase' }}>Trainer Walkthrough Blueprint</span>
        <h1 style={{ margin: '10px 0 5px 0', fontSize: '1.8em' }}>{selectedProductCode} - {selectedProductTitle}</h1>
        <p style={{ margin: 0, color: '#90cdf4', fontSize: '1.1em' }}>Cohort Strategy: {activeTasMeta.name} (v{activeTasMeta.version})</p>
      </div>

      {/* Compliance / Volume HUD */}
      {calculation && (
        <div style={{ ...cardStyle, background: '#f7fafc', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#718096' }}>Total Units</span>
            <strong style={{ fontSize: '1.4em', color: '#2d3748' }}>{calculation.total_units}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#718096' }}>Nominal Hours</span>
            <strong style={{ fontSize: '1.4em', color: '#2d3748' }}>{calculation.total_nominal_hours}h</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85em', color: '#718096' }}>Volume of Learning</span>
            <strong style={{ fontSize: '1.4em', color: calculation.total_volume_of_learning >= calculation.total_nominal_hours ? '#38a169' : '#e53e3e' }}>
              {calculation.total_volume_of_learning}h
            </strong>
          </div>
        </div>
      )}

      {/* 1. Units & Clusters Breakdown */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>📚 Attached Units & Clusters Matrix</h3>
        <p style={{ color: '#718096', fontSize: '0.9em', marginBottom: '20px' }}>
          Overview of how units are structured and grouped for delivery in this qualification:
        </p>

        {Object.keys(groupedUnits).length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>No units have been added to this TAS yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(groupedUnits).map(([clusterName, units]) => (
              <div key={clusterName} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f7fafc', padding: '10px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#2b6cb0', fontSize: '1em' }}>{clusterName}</strong>
                  <span style={{ fontSize: '0.8em', background: '#edf2f7', color: '#4a5568', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    {units.length} unit{units.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ padding: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                    <thead>
                      <tr style={{ color: '#718096', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>
                        <th style={{ paddingBottom: '8px', width: '120px' }}>Code</th>
                        <th style={{ paddingBottom: '8px' }}>Unit Title</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Nominal</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Supervised</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Unsupervised</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u, i) => (
                        <tr key={i} style={{ borderBottom: i < units.length - 1 ? '1px solid #f7fafc' : 'none' }}>
                          <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#2d3748' }}>{u.unit_code}</td>
                          <td style={{ padding: '8px 0', color: '#4a5568' }}>{u.unit_title || 'Title unavailable'}</td>
                          <td style={{ padding: '8px 0', textAlign: 'center', color: '#718096' }}>{u.state_nominal_hours || 0}h</td>
                          <td style={{ padding: '8px 0', textAlign: 'center', color: '#718096' }}>{u.supervised_hours || 0}h</td>
                          <td style={{ padding: '8px 0', textAlign: 'center', color: '#718096' }}>{u.unsupervised_hours || 0}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Target Learner Profile */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>🎯 Target Learner Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
          <div>
            <span style={labelStyle}>Employment Status:</span>
            <p style={textStyle}>{learnerProfile.employment_status || 'Not specified'}</p>
          </div>
          <div>
            <span style={labelStyle}>Reason for Learning:</span>
            <p style={textStyle}>{learnerProfile.reason_for_learning || 'Not specified'}</p>
          </div>
        </div>
        <div>
          <span style={labelStyle}>Industry Entry Experience:</span>
          <p style={textStyle}>{learnerProfile.industry_experience || 'Not specified'}</p>
        </div>
      </div>

      {/* 3. Global Delivery Logistics */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>🚚 Overarching Delivery & Resources</h3>
        <div style={{ marginBottom: '20px' }}>
          <span style={labelStyle}>Delivery Logistics & Structure:</span>
          <p style={textStyle}>{strategyDetails.delivery_logistics || 'No logistics details provided.'}</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <span style={labelStyle}>Training Rationale:</span>
          <p style={textStyle}>{strategyDetails.training_rationale || 'No training rationale provided.'}</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <span style={labelStyle}>Student Support Strategies:</span>
          <p style={textStyle}>{strategyDetails.student_support || 'No student support strategies specified.'}</p>
        </div>
        <div>
          <span style={labelStyle}>Global Facility & Equipment Requirements:</span>
          <p style={textStyle}>{strategyDetails.resource_requirements || 'No general resources specified.'}</p>
        </div>
      </div>

      {/* 4. Cluster & Standalone Delivery & Assessment Strategies */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>📋 Cluster & Unit Delivery & Assessment Strategies</h3>
        <p style={{ color: '#718096', fontSize: '0.9em', marginBottom: '20px' }}>
          The specific methods, rationale, and operational requirements designated for each training group:
        </p>

        {loadingStrategies ? (
          <p style={{ color: '#718096' }}>Loading cluster strategies...</p>
        ) : clusterStrategies.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>No specific cluster strategies have been mapped yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {clusterStrategies.map((strat, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e0', borderRadius: '8px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2b6cb0', fontSize: '1.1em', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  {strat.cluster_name}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>Delivery Methods:</span>
                    <span style={{ fontSize: '0.95em', color: '#2d3748' }}>{strat.delivery_methods?.length ? strat.delivery_methods.join(", ") : 'None specified'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>Assessment Methods:</span>
                    <span style={{ fontSize: '0.95em', color: '#2d3748' }}>{strat.assessment_methods?.length ? strat.assessment_methods.join(", ") : 'None specified'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>Assessment Rationale:</span>
                  <p style={{ fontSize: '0.95em', color: '#2d3748', margin: 0, whiteSpace: 'pre-wrap' }}>{strat.assessment_rationale || 'None provided.'}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>Cluster Resource Requirements:</span>
                  <p style={{ fontSize: '0.95em', color: '#2d3748', margin: 0, whiteSpace: 'pre-wrap' }}>{strat.resource_requirements || 'None specified.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Evaluation Framework */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>📊 Evaluation & Continuous Improvement Plan</h3>
        <div style={{ marginBottom: '15px' }}>
          <span style={labelStyle}>Primary Purposes:</span>
          <p style={textStyle}>{strategyDetails.evaluation_strategy?.purposes?.join(", ") || 'None selected'}</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <span style={labelStyle}>Anticipated Use & Decisions:</span>
          <p style={textStyle}>{strategyDetails.evaluation_strategy?.anticipated_use || 'Not specified'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <span style={labelStyle}>Evaluation Phases:</span>
            <p style={textStyle}>{strategyDetails.evaluation_strategy?.phases?.join(", ") || 'None selected'}</p>
          </div>
          <div>
            <span style={labelStyle}>Data Sources:</span>
            <p style={textStyle}>{strategyDetails.evaluation_strategy?.data_sources?.join(", ") || 'None selected'}</p>
          </div>
        </div>
      </div>

    </div>
  );
}