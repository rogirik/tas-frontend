import React, { useState, useEffect } from "react";
import LinkedIndustryFeedback from '../LinkedIndustryFeedback.jsx';

export default function AssessmentTab({ activeTasId, strategyDetails }) {
  const API_URL = "http://localhost:8000"; 
  
  // State for data
  const [clusterGroups, setClusterGroups] = useState({});
  const [strategies, setStrategies] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});
  
  // State for UI navigation
  const [selectedCluster, setSelectedCluster] = useState(null);

  if (!activeTasId) {
    return <div style={{ padding: '20px' }}>No TAS ID provided. Please open a TAS first.</div>;
  }

  useEffect(() => {
    fetchData();
  }, [activeTasId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch units and group them (standalone units get individual keys so they aren't bunched)
      const unitsRes = await fetch(`${API_URL}/tas/${activeTasId}/units`);
      const unitsData = await unitsRes.json();
      
      const groups = {};
      unitsData.forEach(u => {
        const cName = (!u.cluster_name || u.cluster_name === "Standalone") 
          ? `Standalone: ${u.unit_code}` 
          : u.cluster_name;

        if (!groups[cName]) groups[cName] = [];
        // Ensure unit codes don't duplicate within the group array
        if (!groups[cName].includes(u.unit_code)) {
          groups[cName].push(u.unit_code);
        }
      });
      setClusterGroups(groups);

      // 2. Fetch existing strategies
      const stratRes = await fetch(`${API_URL}/tas/${activeTasId}/cluster_strategies`);
      const stratData = await stratRes.json();

      const stratMap = {};
      Object.keys(groups).forEach(cluster => {
        const existing = stratData.find(s => s.cluster_name === cluster);
        stratMap[cluster] = {
          delivery_methods: existing ? existing.delivery_methods.join(", ") : "",
          assessment_methods: existing ? existing.assessment_methods.join(", ") : "",
          assessment_rationale: existing?.assessment_rationale || "",
          resource_requirements: existing?.resource_requirements || ""
        };
      });
      
      setStrategies(stratMap);
    } catch (error) {
      console.error("Error fetching cluster data:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setStrategies(prev => ({
      ...prev,
      [selectedCluster]: {
        ...prev[selectedCluster],
        [field]: value
      }
    }));
    setSaveStatus(prev => ({ ...prev, [selectedCluster]: null }));
  };

  const handleSave = async () => {
    setSaveStatus(prev => ({ ...prev, [selectedCluster]: "Saving..." }));
    const currentData = strategies[selectedCluster];
    
    const payload = {
      cluster_name: selectedCluster,
      delivery_methods: currentData.delivery_methods.split(",").map(s => s.trim()).filter(s => s),
      assessment_methods: currentData.assessment_methods.split(",").map(s => s.trim()).filter(s => s),
      assessment_rationale: currentData.assessment_rationale,
      resource_requirements: currentData.resource_requirements
    };

    try {
      const response = await fetch(`${API_URL}/tas/${activeTasId}/cluster_strategies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setSaveStatus(prev => ({ ...prev, [selectedCluster]: "Saved successfully!" }));
      } else {
        setSaveStatus(prev => ({ ...prev, [selectedCluster]: "Error saving." }));
      }
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, [selectedCluster]: "Network error." }));
    }
  };

  // Reusable styles matching the rest of the app
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', marginTop: '6px' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '15px', color: '#4a5568' };
  const subTextStyle = { display: 'block', fontSize: '0.85em', color: '#718096', fontWeight: 'normal', marginTop: '4px' };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading strategy workspace...</div>;
  }
  
  if (Object.keys(clusterGroups).length === 0) {
    return <div style={{ padding: '20px', color: '#718096' }}>No units added yet. Please add units in the Unit Matrix tab first.</div>;
  }

  // -----------------------------------------
  // VIEW 2: The Specific Form View
  // -----------------------------------------
  if (selectedCluster) {
    return (
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        
        {/* Header and Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>
          <div>
            <button 
              onClick={() => setSelectedCluster(null)}
              style={{ background: 'transparent', color: '#718096', border: 'none', padding: '0', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ← Back to Strategy Menu
            </button>
            <h2 style={{ margin: 0, color: '#1a365d' }}>Strategy: {selectedCluster}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '0.9em' }}>
              Applies to: {clusterGroups[selectedCluster].join(", ")}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <label style={labelStyle}>
          Delivery Methods (comma separated):
          <span style={subTextStyle}>List the exact delivery methods used for this cluster/unit.</span>
          <input 
            type="text" 
            style={inputStyle}
            value={strategies[selectedCluster]?.delivery_methods || ""}
            onChange={(e) => handleInputChange("delivery_methods", e.target.value)}
            placeholder="e.g. Face-to-face, Online via Zoom, Simulated Workplace"
          />
        </label>

        <label style={labelStyle}>
          Assessment Methods (comma separated):
          <span style={subTextStyle}>List the assessment instruments applied.</span>
          <input 
            type="text" 
            style={inputStyle}
            value={strategies[selectedCluster]?.assessment_methods || ""}
            onChange={(e) => handleInputChange("assessment_methods", e.target.value)}
            placeholder="e.g. Written Knowledge Test, Practical Observation, Portfolio"
          />
        </label>

        <label style={labelStyle}>
          Assessment Rationale:
          <span style={subTextStyle}>Justify why these assessment methods are appropriate.</span>
          <textarea 
            rows="3" 
            style={inputStyle}
            value={strategies[selectedCluster]?.assessment_rationale || ""}
            onChange={(e) => handleInputChange("assessment_rationale", e.target.value)}
            placeholder="e.g. A portfolio approach was selected to allow students to gather evidence over time..."
          />
        </label>

        <label style={labelStyle}>
          Resource Requirements (Specific to this group):
          <span style={subTextStyle}>List any specialized equipment or environments needed.</span>
          <textarea 
            rows="3" 
            style={inputStyle}
            value={strategies[selectedCluster]?.resource_requirements || ""}
            onChange={(e) => handleInputChange("resource_requirements", e.target.value)}
            placeholder="e.g. Specific PPE, specialized software licenses, safety harnesses..."
          />
        </label>

        {/* Dynamic Industry Feedback Injection */}
        <LinkedIndustryFeedback 
          engagements={strategyDetails?.industry_engagements} 
          targetArea={`Cluster: ${selectedCluster}`} 
        />

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
          <button 
            onClick={handleSave}
            style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Save Strategy for {selectedCluster}
          </button>
          <span style={{ fontWeight: 'bold', color: saveStatus[selectedCluster] === "Saved successfully!" ? '#38a169' : '#e53e3e' }}>
            {saveStatus[selectedCluster]}
          </span>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // VIEW 1: The Master List Menu
  // -----------------------------------------
  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ marginTop: 0, color: '#2d3748' }}>Delivery & Assessment Mapping</h2>
      <p style={{ color: '#718096', marginBottom: '25px' }}>
        Select a cluster or standalone unit to define its specific delivery and assessment strategy.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {Object.entries(clusterGroups).map(([clusterName, unitCodes]) => (
          <div 
            key={clusterName} 
            onClick={() => setSelectedCluster(clusterName)}
            style={{ 
              background: '#f7fafc', 
              border: '1px solid #cbd5e0', 
              padding: '20px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#3182ce'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#2b6cb0' }}>{clusterName}</h3>
            <p style={{ margin: 0, fontSize: '0.85em', color: '#4a5568', fontWeight: 'bold' }}>
              {unitCodes.length} Unit{unitCodes.length > 1 ? 's' : ''} Attached:
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#718096' }}>
              {unitCodes.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}