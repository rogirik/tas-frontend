import React, { useState, useEffect } from 'react';

export default function AuditLogModal({ tasId, onClose, API_URL, getAuthHeaders }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/tas/${tasId}/audit`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load audit logs:", err);
        setLoading(false);
      });
  }, [tasId, API_URL, getAuthHeaders]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1a365d' }}>TAS Version History & Snapshots</h2>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
          {loading ? (
            <p style={{ color: '#718096' }}>Loading history...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: '#718096', fontStyle: 'italic' }}>No audit logs recorded for this TAS yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {logs.map(log => (
                <div key={log.id} style={{ borderLeft: '3px solid #3182ce', background: '#f7fafc', borderRadius: '0 6px 6px 0', overflow: 'hidden' }}>
                  
                  {/* Log Header */}
                  <div style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong style={{ color: '#2b6cb0' }}>{log.action} (Archived v{log.version})</strong>
                      <span style={{ fontSize: '0.8em', color: '#a0aec0' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#4a5568' }}>{log.details}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8em', color: '#718096' }}>Triggered by: {log.user_email || 'System'}</span>
                      
                      {log.snapshot && (
                        <button 
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          style={{ background: 'transparent', color: '#3182ce', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', textDecoration: 'underline' }}
                        >
                          {expandedLogId === log.id ? "Hide Historical Data" : "View Previous Version Data"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Snapshot Data */}
                  {expandedLogId === log.id && log.snapshot && (
                    <div style={{ background: '#2d3748', color: '#e2e8f0', padding: '15px', fontSize: '0.85em', overflowX: 'auto', borderTop: '1px solid #4a5568' }}>
                      <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                        {JSON.stringify(log.snapshot, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}