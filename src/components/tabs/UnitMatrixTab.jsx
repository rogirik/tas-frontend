import React, { useState, useEffect } from 'react';

export default function UnitMatrixTab({ 
  tasId,
  productType = 'Qualification',
  initialPackagingRules = '',
  accessToken,
  apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000',
  onSyncComplete,
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

  const [packagingRules, setPackagingRules] = useState(initialPackagingRules);
  const [rulesExpanded, setRulesExpanded] = useState(true);
  const [tgaElectives, setTgaElectives] = useState([]);
  const [showElectives, setShowElectives] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Add Unit Form: dropdown mode ('existing' or 'new')
  const [addClusterMode, setAddClusterMode] = useState('new');

  // Inline Unit Edit State
  const [editingUnitCode, setEditingUnitCode] = useState(null);
  const [editSupervised, setEditSupervised] = useState('');
  const [editUnsupervised, setEditUnsupervised] = useState('');
  const [editClusterSelect, setEditClusterSelect] = useState('Standalone');
  const [editCustomClusterName, setEditCustomClusterName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Inline Cluster Rename State
  const [renamingCluster, setRenamingCluster] = useState(null);
  const [newClusterTitle, setNewClusterTitle] = useState('');
  const [savingClusterName, setSavingClusterName] = useState(false);

  useEffect(() => {
    setPackagingRules(initialPackagingRules || '');
  }, [initialPackagingRules]);

  const handleSyncFromTGA = async () => {
    if (!tasId) {
      setSyncError('No TAS selected to sync.');
      return;
    }
    setSyncing(true);
    setSyncError(null);
    setSyncMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/tas/${tasId}/sync-tga`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sync with Training.gov.au.');
      }

      setPackagingRules(data.packaging_rules || '');
      setTgaElectives(data.elective_units || []);
      setRulesExpanded(true);

      const addedText =
        data.core_units_added > 0
          ? `Added ${data.core_units_added} unit${data.core_units_added === 1 ? '' : 's'} with nominal hours applied.`
          : 'All required units were already in this TAS.';

      setSyncMessage(`${data.message}. ${addedText}`);

      if (typeof onSyncComplete === 'function') {
        onSyncComplete(data);
      }
    } catch (err) {
      setSyncError(err.message || 'Could not reach Training.gov.au.');
    } finally {
      setSyncing(false);
    }
  };

  // Auto-apply nominal hours when selecting a unit from the search dropdown
  const handleSelectSearchUnit = (unit) => {
    setSelectedUnitCode(unit.unit_code);
    setSupervisedHours(unit.nominal_hours != null ? String(unit.nominal_hours) : '0');
    if (unsupervisedHours === '' || unsupervisedHours == null) {
      setUnsupervisedHours('0');
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  // Auto-apply nominal hours when quick-picking a TGA elective
  const handleSelectTgaElective = async (unitCode) => {
    setSelectedUnitCode(unitCode);
    setSearchQuery('');
    setSearchResults([]);

    try {
      const res = await fetch(`${apiBaseUrl}/units/search?query=${encodeURIComponent(unitCode)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const match = data.find(u => u.unit_code?.toUpperCase() === unitCode.toUpperCase());
        if (match && match.nominal_hours != null) {
          setSupervisedHours(String(match.nominal_hours));
          if (unsupervisedHours === '' || unsupervisedHours == null) {
            setUnsupervisedHours('0');
          }
        }
      }
    } catch (err) {
      console.error('Could not pre-fill nominal hours for elective:', err);
    }
  };

  const startEditingUnit = (unit) => {
    setEditingUnitCode(unit.unit_code);
    setEditSupervised(unit.supervised_hours ?? 0);
    setEditUnsupervised(unit.unsupervised_hours ?? 0);

    const currentCluster = unit.cluster_name || 'Standalone';
    if (currentCluster === 'Standalone') {
      setEditClusterSelect('Standalone');
      setEditCustomClusterName('');
    } else {
      setEditClusterSelect(currentCluster);
      setEditCustomClusterName('');
    }
    setSyncError(null);
  };

  const cancelEditingUnit = () => {
    setEditingUnitCode(null);
    setEditSupervised('');
    setEditUnsupervised('');
    setEditClusterSelect('Standalone');
    setEditCustomClusterName('');
  };

  const handleSaveUnitEdit = async (unitCode) => {
    if (!tasId) return;
    setSavingEdit(true);
    setSyncError(null);

    const finalCluster =
      editClusterSelect === '__NEW__'
        ? (editCustomClusterName.trim() || 'Standalone')
        : editClusterSelect;

    try {
      const response = await fetch(`${apiBaseUrl}/tas/${tasId}/units/${unitCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          supervised_hours: parseFloat(editSupervised) || 0,
          unsupervised_hours: parseFloat(editUnsupervised) || 0,
          cluster_name: finalCluster
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update unit.');
      }

      setEditingUnitCode(null);
      setSyncMessage(`Updated ${unitCode}.`);

      if (typeof onSyncComplete === 'function') {
        onSyncComplete(data);
      }
    } catch (err) {
      setSyncError(err.message || 'Could not save unit changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const startRenamingCluster = (cName) => {
    setRenamingCluster(cName);
    setNewClusterTitle(cName);
    setSyncError(null);
  };

  const cancelRenamingCluster = () => {
    setRenamingCluster(null);
    setNewClusterTitle('');
  };

  const handleSaveClusterRename = async (oldName) => {
    const trimmed = newClusterTitle.trim();
    if (!trimmed || trimmed === oldName) {
      cancelRenamingCluster();
      return;
    }

    setSavingClusterName(true);
    setSyncError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/tas/${tasId}/clusters/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          old_name: oldName,
          new_name: trimmed
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to rename cluster.');
      }

      setRenamingCluster(null);
      setNewClusterTitle('');
      setSyncMessage(data.message || `Renamed cluster to "${trimmed}".`);

      if (typeof onSyncComplete === 'function') {
        onSyncComplete(data);
      }
    } catch (err) {
      setSyncError(err.message || 'Could not rename cluster.');
    } finally {
      setSavingClusterName(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '1em',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1e293b'
  };
  const inlineInputStyle = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #3182ce',
    fontSize: '0.9em',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1e293b'
  };
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' };

  // Group tasUnits: standalone units get individual keys so they are never bunched together
  const groupedUnits = {};
  const existingClusterNames = new Set();

  (tasUnits || []).forEach(u => {
    const isStandalone = !u.cluster_name || u.cluster_name === 'Standalone';
    const cName = isStandalone ? `Standalone: ${u.unit_code}` : u.cluster_name;

    if (!isStandalone) {
      existingClusterNames.add(u.cluster_name);
    }

    if (!groupedUnits[cName]) groupedUnits[cName] = [];
    groupedUnits[cName].push(u);
  });

  const clusterKeys = Object.keys(groupedUnits);
  const existingClusterList = Array.from(existingClusterNames);
  const isCustom = productType === 'Custom';
  const rulesHeading =
    productType === 'Skill Set'
      ? '📋 Skill Set Requirements'
      : '📋 Qualification Packaging Rules';

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      {/* Header Row with Sync from TGA Button (Always Visible) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, color: '#1a365d' }}>Unit Matrix, Grouping & Delivery Sequence</h2>
        <button
          type="button"
          onClick={handleSyncFromTGA}
          disabled={syncing}
          style={{
            background: syncing ? '#a0aec0' : '#2b6cb0',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9em'
          }}
        >
          {syncing ? '⏳ Contacting TGA...' : '🔄 Sync Core Units & Rules from TGA'}
        </button>
      </div>

      {/* Sync Status / Error Banners */}
      {syncMessage && (
        <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', color: '#22543d', padding: '12px 15px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9em' }}>
          {syncMessage}
        </div>
      )}
      {syncError && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#9b2c2c', padding: '12px 15px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9em' }}>
          {syncError}
        </div>
      )}

      {/* Collapsible Packaging Rules Strip (Hidden for Custom Selections) */}
      {!isCustom && (
        <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', padding: '14px 18px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#2a4365', fontSize: '0.95em' }}>{rulesHeading}</strong>
            <button
              type="button"
              onClick={() => setRulesExpanded(prev => !prev)}
              style={{ background: 'transparent', border: 'none', color: '#2b6cb0', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
            >
              {rulesExpanded ? 'Hide ▲' : 'Show ▼'}
            </button>
          </div>

          {rulesExpanded && (
            <div style={{ marginTop: '10px', color: '#2c5282', fontSize: '0.9em', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {packagingRules ? (
                packagingRules
              ) : (
                <span style={{ fontStyle: 'italic', color: '#4a5568' }}>
                  No packaging rules synced yet. Click "Sync Core Units & Rules from TGA" above to import them.
                </span>
              )}
            </div>
          )}

          {/* Quick-Pick Electives List (shown after a TGA sync) */}
          {tgaElectives.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #bee3f8' }}>
              <button
                type="button"
                onClick={() => setShowElectives(prev => !prev)}
                style={{ background: 'transparent', border: 'none', color: '#2b6cb0', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', padding: 0 }}
              >
                {showElectives ? `Hide TGA Listed Electives (${tgaElectives.length}) ▲` : `Browse TGA Listed Electives (${tgaElectives.length}) ▼`}
              </button>

              {showElectives && (
                <div style={{ marginTop: '8px', maxHeight: '180px', overflowY: 'auto', background: 'white', border: '1px solid #bee3f8', borderRadius: '6px' }}>
                  {tgaElectives.map(el => (
                    <div
                      key={el.code}
                      onClick={() => handleSelectTgaElective(el.code)}
                      style={{ padding: '8px 12px', borderBottom: '1px solid #edf2f7', cursor: 'pointer', fontSize: '0.85em', display: 'flex', justifyContent: 'space-between', gap: '10px', color: '#1e293b' }}
                      title="Click to populate unit code and nominal hours in the form below"
                    >
                      <span><strong>{el.code}</strong> — {el.title}</span>
                      <span style={{ color: '#3182ce', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Select</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                    onClick={() => handleSelectSearchUnit(unit)} 
                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #edf2f7', fontSize: '0.9em', color: '#1e293b' }}
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

        {/* Clustering Options (Proper Select Dropdown + New Cluster Input) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', background: 'white', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568', fontSize: '0.95em' }}>
            <input 
              type="checkbox" 
              checked={isClustered} 
              onChange={(e) => {
                const checked = e.target.checked;
                setIsClustered(checked);
                if (checked && existingClusterList.length > 0) {
                  setAddClusterMode('existing');
                  setClusterName(existingClusterList[0]);
                } else if (checked) {
                  setAddClusterMode('new');
                }
              }} 
              style={{ width: '18px', height: '18px' }}
            />
            Deliver as part of a Unit Cluster
          </label>

          {isClustered && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
              {existingClusterList.length > 0 && (
                <select
                  value={addClusterMode === 'new' ? '__NEW__' : clusterName}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setAddClusterMode('new');
                      setClusterName('');
                    } else {
                      setAddClusterMode('existing');
                      setClusterName(e.target.value);
                    }
                  }}
                  style={{ ...inputStyle, padding: '8px 12px', width: 'auto', minWidth: '180px' }}
                >
                  {existingClusterList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="__NEW__">+ Create New Cluster...</option>
                </select>
              )}

              {(addClusterMode === 'new' || existingClusterList.length === 0) && (
                <input 
                  type="text" 
                  value={clusterName} 
                  onChange={(e) => setClusterName(e.target.value)} 
                  placeholder="Enter new cluster name..." 
                  style={{ ...inputStyle, padding: '8px 12px', flex: 1 }} 
                />
              )}
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

      {/* Attached Units Display Table with Reordering, Cluster Renaming & Inline Editing */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#2d3748', fontSize: '1.2em', margin: 0 }}>Current Unit Structure & Delivery Sequence</h3>
        <span style={{ fontSize: '0.85em', color: '#718096' }}>Use arrows to reorder, or ✏️ to rename clusters & edit units</span>
      </div>
      
      {clusterKeys.length === 0 ? (
        <p style={{ color: '#718096', fontStyle: 'italic' }}>No units added to this TAS blueprint yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {clusterKeys.map((cName, index) => {
            const units = groupedUnits[cName];
            const isStandaloneCard = cName.startsWith('Standalone: ');
            const isRenamingThisCluster = renamingCluster === cName;

            return (
              <div key={`cluster-card-${cName}`} style={{ border: '1px solid #cbd5e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#edf2f7', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e0', gap: '12px', flexWrap: 'wrap' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
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

                    {isRenamingThisCluster ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '420px' }}>
                        <strong style={{ color: '#1a365d', whiteSpace: 'nowrap' }}>Seq #{index + 1}:</strong>
                        <input
                          type="text"
                          value={newClusterTitle}
                          onChange={(e) => setNewClusterTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveClusterRename(cName);
                            if (e.key === 'Escape') cancelRenamingCluster();
                          }}
                          autoFocus
                          style={{ ...inlineInputStyle, padding: '5px 10px' }}
                        />
                        <button
                          type="button"
                          disabled={savingClusterName}
                          onClick={() => handleSaveClusterRename(cName)}
                          style={{ background: '#38a169', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                          title="Save cluster name"
                        >
                          {savingClusterName ? '...' : '💾'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelRenamingCluster}
                          style={{ background: '#a0aec0', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                          title="Cancel"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#1a365d', fontSize: '1.05em' }}>Seq #{index + 1}: {cName}</strong>
                        {!isStandaloneCard && (
                          <button
                            type="button"
                            onClick={() => startRenamingCluster(cName)}
                            style={{ background: 'white', color: '#2b6cb0', border: '1px solid #cbd5e0', borderRadius: '4px', padding: '2px 7px', cursor: 'pointer', fontSize: '0.78em', fontWeight: 'bold' }}
                            title="Rename this cluster"
                          >
                            ✏️ Rename
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '0.8em', background: 'white', color: '#4a5568', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #cbd5e0' }}>
                    {units.length} unit{units.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ padding: '15px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                    <thead>
                      <tr style={{ color: '#718096', textAlign: 'left', borderBottom: '2px solid #edf2f7' }}>
                        <th style={{ paddingBottom: '8px', width: '120px' }}>Code</th>
                        <th style={{ paddingBottom: '8px' }}>Unit Title</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '80px' }}>Nominal</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '95px' }}>Supervised</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '105px' }}>Unsupervised</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'center', width: '110px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u, i) => {
                        const isEditing = editingUnitCode === u.unit_code;
                        return (
                          <tr key={`row-${cName}-${u.unit_code}-${i}`} style={{ borderBottom: i < units.length - 1 ? '1px solid #f7fafc' : 'none', background: isEditing ? '#ebf8ff' : 'transparent' }}>
                            <td style={{ padding: '10px 6px 10px 0', fontWeight: 'bold', color: '#2d3748', verticalAlign: 'top' }}>{u.unit_code}</td>
                            <td style={{ padding: '10px 10px 10px 0', color: '#4a5568', verticalAlign: 'top' }}>
                              <div>{u.unit_title || 'Title unavailable'}</div>
                              {isEditing && (
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: '#2b6cb0', whiteSpace: 'nowrap' }}>Cluster:</span>
                                  <select
                                    value={editClusterSelect}
                                    onChange={(e) => setEditClusterSelect(e.target.value)}
                                    style={{ ...inlineInputStyle, width: 'auto', minWidth: '170px' }}
                                  >
                                    <option value="Standalone">Standalone (No Cluster)</option>
                                    {existingClusterList.map(name => (
                                      <option key={name} value={name}>{name}</option>
                                    ))}
                                    <option value="__NEW__">+ Create New Cluster...</option>
                                  </select>

                                  {editClusterSelect === '__NEW__' && (
                                    <input
                                      type="text"
                                      value={editCustomClusterName}
                                      onChange={(e) => setEditCustomClusterName(e.target.value)}
                                      placeholder="New cluster name..."
                                      style={{ ...inlineInputStyle, maxWidth: '200px' }}
                                    />
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '10px 0', textAlign: 'center', color: '#718096', verticalAlign: 'top' }}>{u.state_nominal_hours || 0}h</td>
                            <td style={{ padding: '10px 6px', textAlign: 'center', color: '#718096', verticalAlign: 'top' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={editSupervised}
                                  onChange={(e) => setEditSupervised(e.target.value)}
                                  style={{ ...inlineInputStyle, textAlign: 'center' }}
                                />
                              ) : (
                                `${u.supervised_hours || 0}h`
                              )}
                            </td>
                            <td style={{ padding: '10px 6px', textAlign: 'center', color: '#718096', verticalAlign: 'top' }}>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={editUnsupervised}
                                  onChange={(e) => setEditUnsupervised(e.target.value)}
                                  style={{ ...inlineInputStyle, textAlign: 'center' }}
                                />
                              ) : (
                                `${u.unsupervised_hours || 0}h`
                              )}
                            </td>
                            <td style={{ padding: '10px 0', textAlign: 'center', verticalAlign: 'top' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    disabled={savingEdit}
                                    onClick={() => handleSaveUnitEdit(u.unit_code)}
                                    style={{ background: '#38a169', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: savingEdit ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                                    title="Save changes"
                                  >
                                    {savingEdit ? '...' : '💾'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditingUnit}
                                    style={{ background: '#a0aec0', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                                    title="Cancel"
                                  >
                                    ✖
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => startEditingUnit(u)}
                                    style={{ background: '#4299e1', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                                    title={`Edit ${u.unit_code}`}
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteUnit(u.unit_code)}
                                    style={{ background: '#fc8181', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                                    title={`Remove ${u.unit_code}`}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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