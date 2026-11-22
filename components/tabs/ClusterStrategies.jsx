import React, { useState, useEffect } from "react";

export default function ClusterStrategies({ tasId }) {
  // Use your local backend URL for development
  const API_URL = "http://localhost:8000"; 
  
  const [clusters, setClusters] = useState([]);
  const [strategies, setStrategies] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({});

  useEffect(() => {
    if (!tasId) return;
    fetchData();
  }, [tasId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch units to figure out what clusters exist
      const unitsRes = await fetch(`${API_URL}/tas/${tasId}/units`);
      const unitsData = await unitsRes.json();
      
      // Extract unique cluster names from the units list
      const uniqueClusters = [...new Set(unitsData.map(u => u.cluster_name || "Unclustered"))];
      setClusters(uniqueClusters);

      // 2. Fetch existing saved strategies for this TAS
      const stratRes = await fetch(`${API_URL}/tas/${tasId}/cluster_strategies`);
      const stratData = await stratRes.json();

      // Convert the array of strategies into an object keyed by cluster_name for easy editing
      const stratMap = {};
      uniqueClusters.forEach(cluster => {
        // Find existing data, or set blank defaults
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

  const handleInputChange = (clusterName, field, value) => {
    setStrategies(prev => ({
      ...prev,
      [clusterName]: {
        ...prev[clusterName],
        [field]: value
      }
    }));
    // Clear save status when user starts typing again
    setSaveStatus(prev => ({ ...prev, [clusterName]: null }));
  };

  const handleSave = async (clusterName) => {
    setSaveStatus(prev => ({ ...prev, [clusterName]: "Saving..." }));
    
    const currentData = strategies[clusterName];
    
    // Convert comma-separated strings back into arrays for the Python backend
    const payload = {
      cluster_name: clusterName,
      delivery_methods: currentData.delivery_methods.split(",").map(s => s.trim()).filter(s => s),
      assessment_methods: currentData.assessment_methods.split(",").map(s => s.trim()).filter(s => s),
      assessment_rationale: currentData.assessment_rationale,
      resource_requirements: currentData.resource_requirements
    };

    try {
      const response = await fetch(`${API_URL}/tas/${tasId}/cluster_strategies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setSaveStatus(prev => ({ ...prev, [clusterName]: "Saved successfully!" }));
      } else {
        setSaveStatus(prev => ({ ...prev, [clusterName]: "Error saving." }));
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus(prev => ({ ...prev, [clusterName]: "Network error." }));
    }
  };

  if (loading) return <p>Loading cluster strategies...</p>;
  if (clusters.length === 0) return <p>No units added yet. Add units to define clusters.</p>;

  return (
    <div className="cluster-strategies-container">
      <h2>Delivery & Assessment Strategies</h2>
      <p>Configure specific methods and requirements for each unit cluster.</p>

      {clusters.map((clusterName) => (
        <div key={clusterName} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
          <h3>{clusterName}</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
            <label>
              <strong>Delivery Methods (comma separated):</strong>
              <input 
                type="text" 
                style={{ width: "100%", padding: "8px" }}
                value={strategies[clusterName]?.delivery_methods || ""}
                onChange={(e) => handleInputChange(clusterName, "delivery_methods", e.target.value)}
                placeholder="e.g. Face-to-face, Online via Zoom, Simulated Workplace"
              />
            </label>

            <label>
              <strong>Assessment Methods (comma separated):</strong>
              <input 
                type="text" 
                style={{ width: "100%", padding: "8px" }}
                value={strategies[clusterName]?.assessment_methods || ""}
                onChange={(e) => handleInputChange(clusterName, "assessment_methods", e.target.value)}
                placeholder="e.g. Written Knowledge Test, Practical Observation, Portfolio"
              />
            </label>

            <label>
              <strong>Assessment Rationale:</strong>
              <textarea 
                rows="3" 
                style={{ width: "100%", padding: "8px" }}
                value={strategies[clusterName]?.assessment_rationale || ""}
                onChange={(e) => handleInputChange(clusterName, "assessment_rationale", e.target.value)}
                placeholder="Justify why these assessment methods are appropriate for this cluster..."
              />
            </label>

            <label>
              <strong>Resource Requirements:</strong>
              <textarea 
                rows="3" 
                style={{ width: "100%", padding: "8px" }}
                value={strategies[clusterName]?.resource_requirements || ""}
                onChange={(e) => handleInputChange(clusterName, "resource_requirements", e.target.value)}
                placeholder="List specific equipment, facilities, or tech needed for this cluster..."
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button 
              onClick={() => handleSave(clusterName)}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Save {clusterName} Strategy
            </button>
            <span style={{ fontWeight: "bold", color: saveStatus[clusterName] === "Saved successfully!" ? "green" : "red" }}>
              {saveStatus[clusterName]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}