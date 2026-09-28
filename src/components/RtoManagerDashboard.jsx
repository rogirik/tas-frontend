import { useState, useEffect } from 'react';

export default function RtoManagerDashboard({ API_URL, getAuthHeaders, onResumeTas }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [orgDetails, setOrgDetails] = useState(null);
  
  // Team Management State
  const [staff, setStaff] = useState({ active: [], pending: [] });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('auditor');
  const [staffMessage, setStaffMessage] = useState('');

  const fetchAllDocs = () => {
    setLoading(true);
    fetch(`${API_URL}/tas`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        setDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading dashboard data:", err);
        setMessage("Failed to load documents.");
        setLoading(false);
      });
  };

  const fetchStaff = () => {
    fetch(`${API_URL}/organization/staff`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { if (data.active) setStaff(data); })
      .catch(err => console.error("Could not load staff", err));
  };

  useEffect(() => {
    fetchAllDocs();
    
    fetch(`${API_URL}/organization/me`, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch org details");
        return res.json();
      })
      .then(data => {
        setOrgDetails(data);
        if (data.user_role === 'admin') fetchStaff();
      })
      .catch(err => console.error("Error with org details:", err));
  }, []);

  const handleUpdateStatus = (tasId, newStatus) => {
    fetch(`${API_URL}/tas/${tasId}/status`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update status");
      fetchAllDocs();
    })
    .catch(err => setMessage("Error: Only Admins or Designers can modify status."));
  };

  const handleInviteStaff = (e) => {
    e.preventDefault();
    setStaffMessage("Sending invite...");
    fetch(`${API_URL}/organization/staff`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ email: inviteEmail, role: inviteRole })
    })
    .then(res => res.json())
    .then(data => {
      setStaffMessage(data.message || data.detail || "Success!");
      setInviteEmail('');
      fetchStaff();
    });
  };

  const handleRoleChange = (userId, newRole) => {
    fetch(`${API_URL}/organization/staff/${userId}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ role: newRole })
    })
    .then(res => res.json())
    .then(data => {
      if (data.detail) alert(data.detail);
      fetchStaff();
    });
  };

  const handleCancelInvite = (email) => {
    fetch(`${API_URL}/organization/staff/invite?email=${encodeURIComponent(email)}`, {
      method: 'DELETE', headers: getAuthHeaders()
    }).then(() => fetchStaff());
  };

  const totalStrats = docs.length;
  const pendingDrafts = docs.filter(d => d.status === 'Draft' || !d.status).length;
  const publishedDocs = docs.filter(d => d.status === 'Published').length;

  return (
    <div style={{ background: '#111827', padding: '30px', borderRadius: '10px', color: '#f3f4f6', minHeight: '600px' }}>
      
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#f9fafb', fontSize: '1.8em' }}>RTO Manager Compliance Dashboard</h2>
          <p style={{ margin: 0, color: '#9ca3af' }}>Review, publish, and audit training and assessment strategies across the RTO.</p>
        </div>
        <button onClick={fetchAllDocs} style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #4b5563', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔄 Refresh
        </button>
      </div>

      {message && <div style={{ marginBottom: '20px', padding: '12px', background: '#7f1d1d', color: '#fca5a5', borderRadius: '6px', border: '1px solid #991b1b' }}>{message}</div>}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1e3a8a', border: '1px solid #2563eb', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#bfdbfe', letterSpacing: '1px', marginBottom: '10px' }}>TOTAL STRATEGIES</div>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: 'white', lineHeight: '1' }}>{totalStrats}</div>
        </div>
        <div style={{ background: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#fcd34d', letterSpacing: '1px', marginBottom: '10px' }}>PENDING DRAFTS</div>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: 'white', lineHeight: '1' }}>{pendingDrafts}</div>
        </div>
        <div style={{ background: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#86efac', letterSpacing: '1px', marginBottom: '10px' }}>READY FOR USE (PUBLISHED)</div>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: 'white', lineHeight: '1' }}>{publishedDocs}</div>
        </div>
      </div>

      {/* TAS List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? <p style={{ color: '#9ca3af' }}>Loading documents...</p> : docs.map(doc => (
          <div key={doc.id} style={{ background: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ background: doc.status === 'Published' ? '#065f46' : '#92400e', color: doc.status === 'Published' ? '#a7f3d0' : '#fde68a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  {(doc.status || 'DRAFT').toUpperCase()}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '0.9em' }}>v{doc.version || '1.0'}</span>
              </div>
              <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '4px' }}>
                {doc.product_id} — {doc.tas_name || 'Standard Delivery'}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.95em' }}>
                Delivery Mode: {doc.delivery_mode || 'To be determined'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => onResumeTas(doc)} style={{ background: '#374151', color: '#f3f4f6', border: '1px solid #4b5563', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✏️ Edit Blueprint
              </button>
              {doc.status !== 'Published' && (
                <button onClick={() => handleUpdateStatus(doc.id, 'Published')} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚀 Publish Strategy
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && docs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#1f2937', borderRadius: '8px', border: '1px dashed #374151' }}>
            No strategies found. Go to the Create tab to build your first TAS.
          </div>
        )}
      </div>

      {/* Admin Team Management Section */}
      {orgDetails && orgDetails.user_role === 'admin' && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', padding: '20px', borderRadius: '8px', marginTop: '40px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>🏢 {orgDetails.rto_name} - Staff & Access Management</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.9em', color: '#9ca3af' }}>
            Add staff emails below. Once added, tell them to sign up with that email—the system will automatically grant them access.
          </p>
          
          <form onSubmit={handleInviteStaff} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="email" placeholder="Staff Email Address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #4b5563', background: '#111827', color: '#d1d5db' }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #4b5563', background: '#111827', color: '#d1d5db' }}>
              <option value="auditor">Auditor (Read Only)</option>
              <option value="designer">Designer (Edit Access)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
            <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Authorize Email</button>
          </form>
          {staffMessage && <div style={{ fontSize: '0.85em', color: '#60a5fa', marginBottom: '15px' }}>{staffMessage}</div>}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
            <thead>
              <tr style={{ background: '#111827', textAlign: 'left', borderBottom: '1px solid #374151' }}>
                <th style={{ padding: '10px', color: '#9ca3af' }}>Email / User</th>
                <th style={{ padding: '10px', color: '#9ca3af' }}>Status</th>
                <th style={{ padding: '10px', color: '#9ca3af' }}>Access Level</th>
              </tr>
            </thead>
            <tbody>
              {staff.active.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '10px', color: '#e5e7eb', fontWeight: 'bold' }}>{user.email}</td>
                  <td style={{ padding: '10px', color: '#34d399' }}>Active</td>
                  <td style={{ padding: '10px' }}>
                    <select 
                      value={user.role} 
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #4b5563', background: '#111827', color: '#d1d5db' }}>
                      <option value="auditor">Auditor</option>
                      <option value="designer">Designer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {staff.pending.map(invite => (
                <tr key={invite.email} style={{ borderBottom: '1px solid #374151', opacity: 0.7 }}>
                  <td style={{ padding: '10px', color: '#e5e7eb' }}>{invite.email}</td>
                  <td style={{ padding: '10px', color: '#fcd34d' }}>Pending Signup</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ display: 'inline-block', marginRight: '15px', color: '#9ca3af' }}>{invite.role}</span>
                    <button onClick={() => handleCancelInvite(invite.email)} style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' }}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}