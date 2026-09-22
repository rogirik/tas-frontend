import React from 'react';
import LinkedIndustryFeedback from '../LinkedIndustryFeedback'; // Import the new widget

export default function ResourcesTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  if (!activeTasId) return <div style={{ padding: '20px' }}>No TAS ID provided. Please open a TAS first.</div>;

  const evalData = strategyDetails.evaluation_strategy || { purposes: [], anticipated_use: '', phases: [], process_questions: '', outcome_questions: '', economic_questions: '', data_sources: [], methodology: [], roles_and_risks: '' };

  const updateEvalData = (field, value) => {
    setStrategyDetails(prev => ({ ...prev, evaluation_strategy: { ...evalData, [field]: value } }));
  };

  const toggleArrayItem = (field, item) => {
    const currentArray = evalData[field] || [];
    const newArray = currentArray.includes(item) ? currentArray.filter(i => i !== item) : [...currentArray, item];
    updateEvalData(field, newArray);
  };

  const headerStyle = { color: '#2b6cb0', marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #edf2f7', paddingBottom: '8px' };
  const labelStyle = { display: 'flex', alignItems: 'flex-start', fontSize: '0.9em', color: '#4a5568', marginBottom: '8px', cursor: 'pointer' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.95em', boxSizing: 'border-box', marginTop: '6px', marginBottom: '15px', fontFamily: 'inherit' };
  const subTextStyle = { display: 'block', fontSize: '0.85em', color: '#718096', marginBottom: '6px' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#1a365d', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>Evaluation & Continuous Improvement</h2>
      
      <h4 style={headerStyle}>1. Purpose & Anticipated Use</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <strong style={{ display: 'block', marginBottom: '10px', color: '#2d3748' }}>Primary Evaluation Purposes:</strong>
          {["Enable ongoing improvements and adjustments", "Identify factors for program expansion", "Assess program merits against claims", "Identify emerging needs, gaps, or priorities", "Provide accountability"].map(purpose => (
            <label key={purpose} style={labelStyle}><input type="checkbox" style={{ marginRight: '10px', marginTop: '3px' }} checked={evalData.purposes.includes(purpose)} onChange={() => toggleArrayItem('purposes', purpose)} />{purpose}</label>
          ))}
        </div>
        <div>
          <strong style={{ display: 'block', marginBottom: '5px', color: '#2d3748' }}>Anticipated Use & Decisions:</strong>
          <span style={subTextStyle}>Who receives these findings and what decisions will they inform?</span>
          <textarea style={{ ...inputStyle, minHeight: '120px' }} value={evalData.anticipated_use} onChange={(e) => updateEvalData('anticipated_use', e.target.value)} />
        </div>
      </div>

      <h4 style={headerStyle}>2. Evaluation Questions</h4>
      <label style={{ display: 'block', marginBottom: '15px' }}><strong style={{ color: '#2d3748' }}>Process Questions:</strong><textarea style={{ ...inputStyle, minHeight: '70px' }} value={evalData.process_questions} onChange={(e) => updateEvalData('process_questions', e.target.value)} /></label>
      <label style={{ display: 'block', marginBottom: '15px' }}><strong style={{ color: '#2d3748' }}>Outcome Questions:</strong><textarea style={{ ...inputStyle, minHeight: '70px' }} value={evalData.outcome_questions} onChange={(e) => updateEvalData('outcome_questions', e.target.value)} /></label>
      <label style={{ display: 'block', marginBottom: '15px' }}><strong style={{ color: '#2d3748' }}>Economic Questions:</strong><textarea style={{ ...inputStyle, minHeight: '70px' }} value={evalData.economic_questions} onChange={(e) => updateEvalData('economic_questions', e.target.value)} /></label>

      <h4 style={headerStyle}>3. Data Collection & Methodology</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div><strong style={{ display: 'block', marginBottom: '10px', color: '#2d3748' }}>Evaluation Phases:</strong>{["Post-commencement", "Monitoring", "Impact"].map(phase => (<label key={phase} style={labelStyle}><input type="checkbox" style={{ marginRight: '10px' }} checked={evalData.phases.includes(phase)} onChange={() => toggleArrayItem('phases', phase)} />{phase}</label>))}</div>
        <div><strong style={{ display: 'block', marginBottom: '10px', color: '#2d3748' }}>Data Sources:</strong>{["Student Feedback", "Teacher Feedback", "Observations", "External Assessments", "Internal Assessments", "Administrative Data", "Document Analysis"].map(source => (<label key={source} style={labelStyle}><input type="checkbox" style={{ marginRight: '10px' }} checked={evalData.data_sources.includes(source)} onChange={() => toggleArrayItem('data_sources', source)} />{source}</label>))}</div>
        <div><strong style={{ display: 'block', marginBottom: '10px', color: '#2d3748' }}>Methodologies:</strong>{["Surveys", "Semi-structured Interviews", "Desktop Research", "Literature Review", "Case Studies", "Focus Groups"].map(method => (<label key={method} style={labelStyle}><input type="checkbox" style={{ marginRight: '10px' }} checked={evalData.methodology.includes(method)} onChange={() => toggleArrayItem('methodology', method)} />{method}</label>))}</div>
      </div>

      <h4 style={headerStyle}>4. Implementation & Risk Management</h4>
      <label style={{ display: 'block' }}>
        <strong style={{ color: '#2d3748' }}>Roles, Responsibilities & Ethical Risks:</strong>
        <textarea style={{ ...inputStyle, minHeight: '90px', marginBottom: 0 }} value={evalData.roles_and_risks} onChange={(e) => updateEvalData('roles_and_risks', e.target.value)} />
      </label>

      {/* THE AUTOMATIC FEEDBACK LINK */}
      <LinkedIndustryFeedback engagements={strategyDetails.industry_engagements} targetArea="Global: Evaluation Plan" />

      <div style={{ marginTop: '30px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
        <button onClick={handleSaveDetails} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05em' }}>Save Evaluation Plan</button>
      </div>
    </div>
  );
}