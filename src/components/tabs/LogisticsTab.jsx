import React from 'react';

export default function LogisticsTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  if (!activeTasId) return <div style={{ padding: '20px' }}>No TAS ID provided. Please open a TAS first.</div>;

  const handleInputChange = (field, value) => {
    setStrategyDetails(prev => ({ ...prev, [field]: value }));
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', marginTop: '6px', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '20px', color: '#4a5568' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#1a365d', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>Delivery & Resources</h2>

      <label style={labelStyle}>
        Program Delivery Logistics:
        <span style={{ display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' }}>
          Detail the overarching delivery structure (e.g. term dates, campus locations, scheduling).
        </span>
        <textarea 
          rows="4" 
          style={inputStyle}
          value={strategyDetails.delivery_logistics || ""}
          onChange={(e) => handleInputChange("delivery_logistics", e.target.value)}
          placeholder="e.g. Program is delivered over 12 months, split into 4 terms..."
        />
      </label>

      <label style={labelStyle}>
        Training Rationale:
        <span style={{ display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' }}>
          Why has this specific mode of delivery been chosen for this cohort?
        </span>
        <textarea 
          rows="3" 
          style={inputStyle}
          value={strategyDetails.training_rationale || ""}
          onChange={(e) => handleInputChange("training_rationale", e.target.value)}
          placeholder="e.g. A blended approach was selected to accommodate the working hours..."
        />
      </label>

      <label style={labelStyle}>
        Student Support Strategies:
        <span style={{ display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' }}>
          How will you support LLN needs, reasonable adjustments, and general student welfare?
        </span>
        <textarea 
          rows="3" 
          style={inputStyle}
          value={strategyDetails.student_support || ""}
          onChange={(e) => handleInputChange("student_support", e.target.value)}
          placeholder="e.g. Students identified with LLN needs will be provided additional mentoring..."
        />
      </label>

      <h3 style={{ marginTop: '30px', color: '#2b6cb0', borderBottom: '2px solid #edf2f7', paddingBottom: '8px', marginBottom: '20px' }}>Global Facility & Equipment Requirements</h3>

      <label style={labelStyle}>
        Standard Resources:
        <span style={{ display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' }}>
          Detail the overarching physical or digital resources required for this program.
        </span>
        <textarea 
          rows="3" 
          style={inputStyle}
          value={strategyDetails.resource_requirements || ""}
          onChange={(e) => handleInputChange("resource_requirements", e.target.value)}
          placeholder="e.g. Access to a simulated warehouse environment, generic PPE..."
        />
      </label>

      <label style={labelStyle}>
        Special Resource Requirements:
        <span style={{ display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' }}>
          Are there any specialist tools, licensed software, or third-party facilities required?
        </span>
        <textarea 
          rows="2" 
          style={inputStyle}
          value={strategyDetails.special_requirements || ""}
          onChange={(e) => handleInputChange("special_requirements", e.target.value)}
          placeholder="e.g. 15 licenses for Xero Accounting Software..."
        />
      </label>

      <div style={{ marginTop: '30px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
        <button 
          onClick={handleSaveDetails}
          style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05em' }}
        >
          Save Delivery & Resources Plan
        </button>
      </div>
    </div>
  );
}