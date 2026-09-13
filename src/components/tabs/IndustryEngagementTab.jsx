import React, { useState } from 'react'

export default function IndustryEngagementTab({ activeTasId, strategyDetails, setStrategyDetails, handleSaveDetails }) {
  const [partnerName, setPartnerName] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' }

  const engagements = strategyDetails.industry_engagements || []

  const handleSendAndLog = (e) => {
    e.preventDefault()
    
    if (!partnerName || !partnerEmail) {
      alert("Please fill in the partner's name and email.")
      return
    }

    // Generate the magic native link pointing back to your app
    const nativeLink = `${window.location.origin}/?review=${activeTasId}&email=${encodeURIComponent(partnerEmail)}`

    // Log it to the database instantly
    const newLog = {
      date: new Date().toLocaleDateString(),
      partner_name: partnerName,
      partner_email: partnerEmail,
      status: "Pending Response",
      form_link: nativeLink
    }

    const updatedEngagements = [...engagements, newLog]
    
    setStrategyDetails(prev => {
      const newState = { ...prev, industry_engagements: updatedEngagements }
      fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/tas/${activeTasId}/strategy_details`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newState) 
      })
      return newState
    })

    // Open the email app
    const subject = `Industry Consultation: Training & Assessment Strategy Review`
    const body = `Hi ${partnerName},\n\nWe are currently reviewing our Training and Assessment Strategy (TAS) and highly value your industry expertise.\n\nCould you please take 5 minutes to review our proposed structure and provide your official feedback via our secure portal?\n\nSecure Feedback Portal:\n${nativeLink}\n\nYour feedback ensures our training aligns with current workplace standards.\n\nThank you for your time.`
    
    window.location.href = `mailto:${partnerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setPartnerName('')
    setPartnerEmail('')
  }

  // --- NEW: Resend Function ---
  const handleResend = (log, index) => {
    // Open the email app with a follow-up message
    const subject = `Follow-Up: Industry Consultation for TAS Review`
    const body = `Hi ${log.partner_name},\n\nJust floating this to the top of your inbox. We are currently reviewing our Training and Assessment Strategy (TAS) and would highly value your industry expertise.\n\nCould you please take 5 minutes to provide your official feedback via our secure portal?\n\nSecure Feedback Portal:\n${log.form_link}\n\nThank you for your time and support.`
    
    window.location.href = `mailto:${log.partner_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Update the log status and date
    const updatedEngagements = [...engagements]
    updatedEngagements[index] = {
      ...log,
      date: new Date().toLocaleDateString(), // Bumps the date to today
      status: "Follow-up Sent"
    }

    setStrategyDetails(prev => {
      const newState = { ...prev, industry_engagements: updatedEngagements }
      fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/tas/${activeTasId}/strategy_details`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newState) 
      })
      return newState
    })
  }

  // --- NEW: Delete Function ---
  const handleDeleteLog = (indexToRemove) => {
    if (!window.confirm("Are you sure you want to remove this engagement log?")) return

    const updatedEngagements = engagements.filter((_, idx) => idx !== indexToRemove)
    
    setStrategyDetails(prev => {
      const newState = { ...prev, industry_engagements: updatedEngagements }
      fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/tas/${activeTasId}/strategy_details`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newState) 
      })
      return newState
    })
  }

  return (
    <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0, color: '#2d3748' }}>Industry Engagement & Consultation</h3>
      
      <div style={{ marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Request Industry Feedback</h4>
        <p style={{ fontSize: '0.85em', color: '#718096', marginBottom: '20px' }}>Enter the partner's details. Clicking send will open your email app with a pre-written message containing a secure link to your app's built-in feedback portal, and auto-log the request below.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Partner Name:</label>
            <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="e.g. Jane Smith" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Partner Email:</label>
            <input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="e.g. jane@company.com" style={inputStyle} />
          </div>
        </div>

        <button type="button" onClick={handleSendAndLog} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
          ✉️ Auto-Log & Open Email Client
        </button>
      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2d3748' }}>Consultation Log</h4>
        {engagements.length === 0 ? (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>No industry engagements logged yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9em' }}>
              <thead>
                <tr style={{ background: '#edf2f7' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Date</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Partner</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Email</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Status</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((log, idx) => (
                  <React.Fragment key={idx}>
                    <tr style={{ borderBottom: log.answers ? 'none' : '1px solid #edf2f7' }}>
                      <td style={{ padding: '10px', color: '#718096' }}>{log.date}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#2d3748' }}>{log.partner_name}</td>
                      <td style={{ padding: '10px', color: '#3182ce' }}>{log.partner_email}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          background: log.answers ? '#c6f6d5' : (log.status === "Follow-up Sent" ? '#e9d8fd' : '#feebc8'), 
                          color: log.answers ? '#22543d' : (log.status === "Follow-up Sent" ? '#44337a' : '#dd6b20'), 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' 
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            type="button"
                            onClick={() => handleResend(log, idx)}
                            disabled={!!log.answers}
                            style={{ background: log.answers ? '#cbd5e0' : '#3182ce', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: log.answers ? 'not-allowed' : 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}
                            title={log.answers ? "Already received" : "Resend Email"}
                          >
                            ✉️ Resend
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteLog(idx)}
                            style={{ background: '#fc8181', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }}
                            title="Delete Log"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Automatically expand and show answers if the partner submitted the form */}
                    {log.answers && (
                      <tr style={{ borderBottom: '2px solid #cbd5e0', background: '#f7fafc' }}>
                        <td colSpan="5" style={{ padding: '15px' }}>
                          <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2b6cb0', fontSize: '0.9em' }}>Q1. Industry Requirements:</strong>
                            <p style={{ margin: '4px 0 15px 0', fontSize: '0.9em', color: '#4a5568' }}>{log.answers.q1}</p>
                            
                            <strong style={{ color: '#2b6cb0', fontSize: '0.9em' }}>Q2. Structure & Delivery:</strong>
                            <p style={{ margin: '4px 0 15px 0', fontSize: '0.9em', color: '#4a5568' }}>{log.answers.q2}</p>
                            
                            <strong style={{ color: '#2b6cb0', fontSize: '0.9em' }}>Q3. Workplace Activities:</strong>
                            <p style={{ margin: '4px 0 15px 0', fontSize: '0.9em', color: '#4a5568' }}>{log.answers.q3}</p>
                            
                            <strong style={{ color: '#2b6cb0', fontSize: '0.9em' }}>Q4. Assessment Methods:</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9em', color: '#4a5568' }}>{log.answers.q4}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}