import React from 'react';

export default function StudentSupportTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  if (!activeTasId) return <div style={{ padding: '20px' }}>No TAS ID provided. Please open a TAS first.</div>;

  // Ensure support_plan exists as an object, even if the parent state hasn't initialized it yet
  const supportData = strategyDetails.support_plan || {
    lln_digital_assessment: '',
    disclosure_mechanisms: '',
    trainer_accessibility: '',
    progression_tracking: '',
    intervention_strategy: '',
    adjustment_options: [],
    adjustment_boundaries: '',
    welfare_support: ''
  };

  const updateSupportData = (field, value) => {
    setStrategyDetails(prev => ({ 
      ...prev, 
      support_plan: { ...supportData, [field]: value } 
    }));
  };

  const toggleArrayItem = (field, item) => {
    const currentArray = supportData[field] || [];
    const newArray = currentArray.includes(item) 
      ? currentArray.filter(i => i !== item) 
      : [...currentArray, item];
    updateSupportData(field, newArray);
  };

  const headerStyle = { color: '#2b6cb0', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #edf2f7', paddingBottom: '8px' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' };
  const checkLabelStyle = { display: 'flex', alignItems: 'flex-start', fontSize: '0.9em', color: '#4a5568', marginBottom: '8px', cursor: 'pointer' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.95em', boxSizing: 'border-box', marginTop: '6px', marginBottom: '15px', fontFamily: 'inherit' };
  const subTextStyle = { display: 'block', fontSize: '0.85em', color: '#718096', marginBottom: '6px', fontWeight: 'normal' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#1a365d', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>
        Learner Support & Progression (ASQA Quality Area 2)
      </h2>
      
      <h4 style={headerStyle}>1. Identification of Needs (Pre-Training)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <label style={labelStyle}>
          LLN & Digital Skills Audits:
          <span style={subTextStyle}>How are baseline capabilities assessed prior to enrolment?</span>
          <textarea 
            style={{ ...inputStyle, minHeight: '90px' }} 
            value={supportData.lln_digital_assessment} 
            onChange={(e) => updateSupportData('lln_digital_assessment', e.target.value)} 
            placeholder="e.g. LLN Robot assessment administered during the pre-enrolment phase..."
          />
        </label>
        <label style={labelStyle}>
          Disclosure Mechanisms:
          <span style={subTextStyle}>How do you encourage students to disclose support needs safely?</span>
          <textarea 
            style={{ ...inputStyle, minHeight: '90px' }} 
            value={supportData.disclosure_mechanisms} 
            onChange={(e) => updateSupportData('disclosure_mechanisms', e.target.value)} 
            placeholder="e.g. Confidential intake forms, orientation week interviews..."
          />
        </label>
      </div>

      <h4 style={headerStyle}>2. Academic Support & Progression Monitoring</h4>
      <label style={labelStyle}>
        Trainer Accessibility & Response Times:
        <textarea 
          style={{ ...inputStyle, minHeight: '60px' }} 
          value={supportData.trainer_accessibility} 
          onChange={(e) => updateSupportData('trainer_accessibility', e.target.value)} 
          placeholder="e.g. Trainers available via LMS messaging, 48-hour SLA on assessment feedback..."
        />
      </label>
      <label style={labelStyle}>
        Progression Tracking & Intervention Strategies:
        <span style={subTextStyle}>How are at-risk students identified and managed?</span>
        <textarea 
          style={{ ...inputStyle, minHeight: '90px' }} 
          value={supportData.progression_tracking} 
          onChange={(e) => updateSupportData('progression_tracking', e.target.value)} 
          placeholder="e.g. Weekly LMS login reports triggering an automated Power Automate flow for Dataverse case management..."
        />
      </label>

      <h4 style={headerStyle}>3. Reasonable Adjustments</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div>
          <strong style={{ display: 'block', marginBottom: '10px', color: '#2d3748' }}>Standard Adjustment Options:</strong>
          {[
            "Extended assessment time",
            "Alternative assessment formats (Oral/Verbal)",
            "Provision of a scribe/reader",
            "Assistive technology / Screen readers",
            "Accessible room layouts / Ergonomic furniture",
            "Modified learning materials (Large print, contrast)"
          ].map(option => (
            <label key={option} style={checkLabelStyle}>
              <input 
                type="checkbox" 
                style={{ marginRight: '10px', marginTop: '3px' }} 
                checked={supportData.adjustment_options?.includes(option)} 
                onChange={() => toggleArrayItem('adjustment_options', option)} 
              />
              {option}
            </label>
          ))}
        </div>
        <div>
          <label style={labelStyle}>
            Adjustment Boundaries & Integrity:
            <span style={subTextStyle}>When would a requested adjustment be denied to preserve the integrity of the Training Package?</span>
            <textarea 
              style={{ ...inputStyle, minHeight: '120px' }} 
              value={supportData.adjustment_boundaries} 
              onChange={(e) => updateSupportData('adjustment_boundaries', e.target.value)} 
              placeholder="e.g. Adjustments cannot compromise core physical safety requirements of unit XYZ..."
            />
          </label>
        </div>
      </div>

      <h4 style={headerStyle}>4. Wellbeing & External Support</h4>
      <label style={labelStyle}>
        External Referrals & Welfare Check-ins:
        <span style={subTextStyle}>Procedures for directing students to professional counseling, financial, or housing services.</span>
        <textarea 
          style={{ ...inputStyle, minHeight: '90px', marginBottom: 0 }} 
          value={supportData.welfare_support} 
          onChange={(e) => updateSupportData('welfare_support', e.target.value)} 
        />
      </label>

      <div style={{ marginTop: '30px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
        <button 
          onClick={handleSaveDetails} 
          style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05em' }}>
          Save Support Plan
        </button>
      </div>
    </div>
  );
}