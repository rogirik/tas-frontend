import React from 'react'

export default function UnitMatrixTab({
  isClustered, setIsClustered, clusterName, setClusterName, 
  searchQuery, setSearchQuery, searchResults, setSearchResults,
  selectedUnitCode, setSelectedUnitCode, supervisedHours, setSupervisedHours,
  unsupervisedHours, setUnsupervisedHours, tasUnits, handleAddUnit
}) {
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' }

  return (
    <>
      <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, color: '#2d3748' }}>Add Units & Delivery Structure</h3>
        <form onSubmit={handleAddUnit}>
          
          {/* NEW: Standalone vs Clustered Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Delivery Structure:</label>
            <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: !isClustered ? '#2b6cb0' : '#718096' }}>
                <input 
                  type="radio" 
                  checked={!isClustered} 
                  onChange={() => setIsClustered(false)} 
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                Single Standalone Unit
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: isClustered ? '#2b6cb0' : '#718096' }}>
                <input 
                  type="radio" 
                  checked={isClustered} 
                  onChange={() => setIsClustered(true)} 
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                Part of a Cluster
              </label>
            </div>
          </div>

          {/* Only show Cluster Name input if "Part of a Cluster" is selected */}
          {isClustered && (
            <div style={{ marginBottom: '20px', background: 'white', padding: '15px', border: '1px dashed #cbd5e0', borderRadius: '8px' }}>
              <label style={labelStyle}>Target Cluster Name:</label>
              <input type="text" value={clusterName} onChange={(e) => setClusterName(e.target.value)} style={inputStyle} placeholder="e.g. Cluster 1: Workplace Safety" />
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <label style={labelStyle}>Search Unit:</label>
            <input type="text" placeholder="Type unit code or keyword..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedUnitCode(''); }} style={inputStyle} />
            {searchResults.length > 0 && !selectedUnitCode && (
              <ul style={{ position: 'absolute', background: 'white', border: '1px solid #cbd5e0', width: '100%', listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', zIndex: 10 }}>
                {searchResults.map(unit => (
                  <li key={unit.unit_code} onClick={() => { setSelectedUnitCode(unit.unit_code); setSearchQuery(`${unit.unit_code} - ${unit.unit_title}`); setSearchResults([]); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #edf2f7' }}><strong>{unit.unit_code}</strong>: {unit.unit_title}</li>
                ))}
              </ul>
            )}
          </div>
          
          {selectedUnitCode && (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{flex: 1}}><label style={labelStyle}>Supervised Hours:</label><input type="number" step="0.5" value={supervisedHours} onChange={(e) => setSupervisedHours(e.target.value)} required style={inputStyle} /></div>
              <div style={{flex: 1}}><label style={labelStyle}>Unsupervised Hours:</label><input type="number" step="0.5" value={unsupervisedHours} onChange={(e) => setUnsupervisedHours(e.target.value)} required style={inputStyle} /></div>
            </div>
          )}
          
          <button type="submit" disabled={!selectedUnitCode} style={{ background: selectedUnitCode ? '#38a169' : '#cbd5e0', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: selectedUnitCode ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
            + Attach Unit
          </button>
        </form>
      </div>

      {tasUnits.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#2d3748' }}>Current Strategy Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e0', textAlign: 'left', color: '#4a5568' }}>
                <th style={{ padding: '8px' }}>Cluster / Delivery</th>
                <th style={{ padding: '8px' }}>Unit Code</th>
                <th style={{ padding: '8px' }}>Supervised</th>
                <th style={{ padding: '8px' }}>Unsupervised</th>
              </tr>
            </thead>
            <tbody>
              {tasUnits.map((u, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: u.cluster_name === 'Standalone' ? '#718096' : '#2b6cb0' }}>
                    {u.cluster_name}
                  </td>
                  <td style={{ padding: '8px' }}>{u.unit_code}</td>
                  <td style={{ padding: '8px' }}>{u.supervised_hours}h</td>
                  <td style={{ padding: '8px' }}>{u.unsupervised_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}