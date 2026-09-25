import { useState, useEffect } from 'react'

export default function RtoManagerDashboard({ API_URL, getAuthHeaders, onResumeTas }) {
  const [documents, setDocuments] = useState([])
  const [filterTab, setFilterTab] = useState('all') 
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchAllDocs = () => {
    setLoading(true)
    setErrorMsg('')
    
    fetch(`${API_URL}/tas`, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`)
        return res.json()
      })
      .then(data => {
        setDocuments(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Error loading dashboard data:", err)
        setErrorMsg("Failed to load strategies from server. Check your backend connection or authentication token.")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAllDocs()
  }, [])

  const handleStatusChange = (tasId, newStatus) => {
    fetch(`${API_URL}/tas/${tasId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update status")
      fetchAllDocs() 
    })
    .catch(err => {
      console.error(err)
      alert("Error updating status. Ensure your user role has proper permissions.")
    })
  }

  const filteredDocs = documents.filter(doc => {
    if (filterTab === 'Draft') return doc.status === 'Draft' || !doc.status;
    if (filterTab === 'Published') return doc.status === 'Published';
    return true;
  });

  const draftCount = documents.filter(d => d.status === 'Draft' || !d.status).length;
  const publishedCount = documents.filter(d => d.status === 'Published').length;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#a0aec0', fontSize: '1.1em' }}>Loading RTO Dashboard...</div>

  if (errorMsg) return (
    <div style={{ padding: '30px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', textAlign: 'center' }}>
      <h3>Connection Error</h3>
      <p>{errorMsg}</p>
      <button onClick={fetchAllDocs} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Retry</button>
    </div>
  )

  const cardStyle = { background: '#1a202c', border: '1px solid #2d3748', borderRadius: '8px', padding: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#e2e8f0' }}>RTO Manager Compliance Dashboard</h2>
          <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9em' }}>Review, publish, and audit training and assessment strategies across the RTO.</p>
        </div>
        <button onClick={fetchAllDocs} style={{ background: '#2d3748', border: '1px solid #4a5568', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#e2e8f0' }}>🔄 Refresh</button>
      </div>

      {/* Metric Cards / Filter Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '25px' }}>
        <div onClick={() => setFilterTab('all')} style={{ background: filterTab === 'all' ? '#2a4365' : '#1a202c', border: `2px solid ${filterTab === 'all' ? '#3182ce' : '#2d3748'}`, padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
          <div style={{ fontSize: '0.85em', color: '#a0aec0', fontWeight: 'bold' }}>TOTAL STRATEGIES</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>{documents.length}</div>
        </div>
        <div onClick={() => setFilterTab('Draft')} style={{ background: filterTab === 'Draft' ? '#744210' : '#1a202c', border: `2px solid ${filterTab === 'Draft' ? '#d69e2e' : '#2d3748'}`, padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
          <div style={{ fontSize: '0.85em', color: '#ecc94b', fontWeight: 'bold' }}>PENDING DRAFTS</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>{draftCount}</div>
        </div>
        <div onClick={() => setFilterTab('Published')} style={{ background: filterTab === 'Published' ? '#22543d' : '#1a202c', border: `2px solid ${filterTab === 'Published' ? '#38a169' : '#2d3748'}`, padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
          <div style={{ fontSize: '0.85em', color: '#9ae6b4', fontWeight: 'bold' }}>READY FOR USE (PUBLISHED)</div>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>{publishedCount}</div>
        </div>
      </div>

      {/* Document List */}
      <div>
        {filteredDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#1a202c', borderRadius: '8px', color: '#a0aec0', border: '1px solid #2d3748' }}>No strategies found for this filter view. Try creating one in the wizard!</div>
        ) : (
          filteredDocs.map(doc => {
            const isPublished = doc.status === 'Published';
            return (
              <div key={doc.id} style={cardStyle}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ background: isPublished ? '#22543d' : '#744210', color: isPublished ? '#9ae6b4' : '#ecc94b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {doc.status || 'Draft'}
                    </span>
                    <span style={{ fontSize: '0.85em', color: '#a0aec0' }}>v{doc.version || '1.0'}</span>
                  </div>
                  <strong style={{ fontSize: '1.15em', color: 'white', display: 'block' }}>{doc.product_id} — {doc.tas_name || 'Standard Delivery'}</strong>
                  <span style={{ fontSize: '0.85em', color: '#a0aec0' }}>Delivery Mode: {doc.delivery_mode || 'Not specified'}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => onResumeTas(doc)} style={{ background: '#2d3748', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#e2e8f0' }}>
                    ✏️ Edit Blueprint
                  </button>
                  
                  {isPublished ? (
                    <button onClick={() => handleStatusChange(doc.id, 'Draft')} style={{ background: '#744210', border: '1px solid #d69e2e', color: '#feebc8', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      ↩ Revert to Draft
                    </button>
                  ) : (
                    <button onClick={() => handleStatusChange(doc.id, 'Published')} style={{ background: '#276749', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      🚀 Publish Strategy
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
