import React from 'react';

export default function UnitMatrixTab({ 
  isClustered, 
  setIsClustered, 
  clusterName, 
  setClusterName, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  setSearchResults, 
  selectedUnitCode, 
  setSelectedUnitCode, 
  supervisedHours, 
  setSupervisedHours, 
  unsupervisedHours, 
  setUnsupervisedHours, 
  tasUnits, 
  handleAddUnit, 
  handleDeleteUnit,
  handleMoveCluster 
}) {

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' };

  // Group tasUnits: standalone units get individual keys so they are never bunched together
  const groupedUnits = {};
  (tasUnits || []).forEach(u => {
    const cName = (!u.cluster_name || u.cluster_name === "Standalone") 
      ? `Standalone: ${u.unit_code}` 
      : u.cluster_name;

    if (!groupedUnits[cName]) groupedUnits[cName] = [];
    groupedUnits[cName].push(u);
  });

  const clusterKeys = Object.keys(groupedUnits);

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#1a365d', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>Unit Matrix, Grouping & Delivery Sequence</h2>

      {/* Add Unit Form */}
      <form onSubmit={handleAddUnit} style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, color: '#2d3748', fontSize: '1.1em', marginBottom: '15px' }}>Add Unit to Strategy</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '15px', position: 'relative' }}>
          <div>
            <label style={labelStyle}>Search Unit Code or Title:</label>
            <input 
              type="text" 
              placeholder="e.g. TAEDEL311 or HLTAID011" 
              value={selectedUnitCode} 
              onChange={(e) => { setSelectedUnitCode(e.target.value.toUpperCase()); setSearchQuery(e.target.value); }} 
              required 
              style={inputStyle} 
            />
            {searchResults.length > 0 && (
              <ul style={{ position: 'absolute', background: 'white', border: '1px solid #cbd5e0', width: 'calc(100% - 15px)', listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', zIndex: 10, top: '75px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {searchResults.map(unit => (
                  <li 
                    key={`search-${unit.unit_code}`} 
                    onClick={() => { setSelectedUnitCode(unit.unit_code); setSearchResults([]); setSearchQuery(''); }} 
                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #edf2f7', fontSize: '0.9em' }}
                  >
                    <strong>{unit.unit_code}</strong>: {unit.unit_title} ({unit.nominal_hours || 0}h nominal)
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label style={labelStyle}>Supervised Hours:</label>
            <input 
              type="number" 
              step="0.5" 
              placeholder="e.g. 30" 
              value={supervisedHours} 
              onChange={(e) => setSupervisedHours(e.target.value)} 
              required 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={labelStyle}>Unsupervised Hours:</label>
            <input 
              type="number" 
              step="0.5" 
              placeholder="e.g. 10" 
              value={unsupervisedHours} 
              onChange={(e) => setUnsupervisedHours(e.target.value)} 
              required 
              style={inputStyle} 
            />
          </div>
        </div>

        {/* Clustering Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', background: 'white', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568', fontSize: '0.95em' }}>
            <input 
              type="checkbox" 
              checked={isClustered} 
              onChange={(e) => setIsClustered(e.target.checked)} 
              style={{ width: '18px', height: '18px' }}
            />
            Deliver as part of a Unit Cluster
          </label>

          {isClustered && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#4a5568' }}>Cluster Name:</span>
              <input 
                type="text" 
                value={clusterName} 
                onChange={(e) => setClusterName(e.target.value)} 
                placeholder="e.g. Core Training Cluster" 
                style={{ ...inputStyle, padding: '8px 12px', marginTop: 0 }} 
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          style={{ background: '#3182ce', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Unit to Strategy
        </button>
      </form>

      {/* Attached Units Display Table with Reordering Sequence Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#2d3748', fontSize: '1.2em', margin: 0 }}>Current Unit Structure & Delivery Sequence</h3>
        <span style={{ fontSize: '0.85em', color: '#718096' }}>Use arrows to arrange delivery sequence order</span>
      </div>
      
      {clusterKeys.length === 0 ? (
        <p style={{ color: '#718096', fontStyle: 'italic' }}>No units added to this TAS blueprint yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {clusterKeys.map((cName, index) => {
            const units = groupedUnits[cName];
            return (
              <div key={`cluster-card-${cName}`} style={{ border: '1px solid #cbd5e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#edf2f7', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e0' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Sequence Reorder Buttons */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button 
                        disabled={index === 0} 
                        onClick={() => handleMoveCluster && handleMoveCluster(cName, 'up')}
                        style={{ background: index === 0 ? '#cbd5e0' : '#4a5568', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75em', fontWeight: 'bold' }}
                        title="Move Sequence Up"
                      >
                        ▲
                      </button>
                      <button 
                        disabled={index === clusterKeys.length - 1} 
                        onClick={() => handleMoveCluster && handleMoveCluster(cName, 'down')}
                        style={{ background: index === clusterKeys.length - 1 ? '#cbd5e0' : '#4a5568', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: index === clusterKeys.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75em', fontWeight: 'bold' }}
                        title="Move Sequence Down"
                      >
                        ▼
                      </button>
                    </div>
                    <strong style={{ color: '#1a365d', fontSize: '1.05em' }}>Seq #{index + 1}: {cName}</strong>
                  </div>

                  <span style={{ fontSize: '0.8em', background: 'white', color: '#4a5568', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #cbd5e0' }}>
                    {units.length} unit{units.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ padding: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                    <thead>
                      <tr style={{ color: '#718096', textAlign: 'left', borderBottom: '2px solid #edf2f7' }}>
                        <th style={{ paddingBottom: '8px', width: '130px' }}>Code</th>
                        <th style={{ paddingBottom: '8px' }}>Unit Title</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Nominal</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Supervised</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '90px' }}>Unsupervised</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '70px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u, i) => (
                        <tr key={`row-${cName}-${u.unit_code}-${i}`} style={{ borderBottom: i < units.length - 1 ? '1px solid #f7fafc' : 'none' }}>
                          <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#2d3748' }}>{u.unit_code}</td>
                          <td style={{ padding: '10px 0', color: '#4a5568' }}>{u.unit_title || 'Title unavailable'}</td>
                          <td style={{ padding: '10px 0', textAlign: 'center', color: '#718096' }}>{u.state_nominal_hours || 0}h</td>
                          <td style={{ padding: '10px 0', textAlign: 'center', color: '#718096' }}>{u.supervised_hours || 0}h</td>
                          <td style={{ padding: '10px 0', textAlign: 'center', color: '#718096' }}>{u.unsupervised_hours || 0}h</td>
                          <td style={{ padding: '10px 0', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDeleteUnit(u.unit_code)}
                              style={{ background: '#fc8181', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' }}
                              title={`Remove ${u.unit_code}`}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}