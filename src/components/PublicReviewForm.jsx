import React, { useState, useEffect } from 'react';

export default function PublicReviewForm({ tasId, initialEmail }) {
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState(initialEmail || '');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tasName, setTasName] = useState('Training & Assessment Strategy');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/tas`)
      .then(res => res.json())
      .then(data => {
        const doc = data.find(d => d.id == tasId);
        if (doc) setTasName(`${doc.product_id} - ${doc.tas_name}`);
      })
      .catch(err => console.error(err));
  }, [tasId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      partner_name: partnerName,
      partner_email: partnerEmail,
      q1_answer: q1,
      q2_answer: q2,
      q3_answer: q3,
      q4_answer: q4
    };

    fetch(`http://127.0.0.1:8000/tas/${tasId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    })
    .catch(err => alert("Error submitting feedback. Please try again."));
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#38a169', marginTop: 0 }}>✅ Feedback Received</h2>
        <p style={{ color: '#4a5568', fontSize: '1.1em' }}>Thank you for your valuable industry insights. Your official feedback has been securely logged into our compliance system.</p>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '25px', background: '#f7fafc', color: '#2d3748'};
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2d3748', textAlign: 'left', fontSize: '1.05em' };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', textAlign: 'left' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #edf2f7' }}>
        <h2 style={{ color: '#1a365d', margin: '0 0 10px 0' }}>Industry Consultation Review</h2>
        <p style={{ color: '#718096', margin: 0, fontSize: '1.1em' }}>Reviewing: <strong>{tasName}</strong></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Your Email *</label>
            <input type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} required style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>1. Industry Requirements</label>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#718096' }}>Does the proposed training meet current industry needs, standards, and employer expectations?</p>
        <textarea value={q1} onChange={e => setQ1(e.target.value)} required rows="4" style={inputStyle} />

        <label style={labelStyle}>2. Structure & Delivery</label>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#718096' }}>Is the training set up in a logical way that makes sense for both learners and the reality of the workplace?</p>
        <textarea value={q2} onChange={e => setQ2(e.target.value)} required rows="4" style={inputStyle} />

        <label style={labelStyle}>3. Workplace Activities</label>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#718096' }}>Do the proposed learning activities and practical tasks accurately reflect what workers will actually be doing in the industry?</p>
        <textarea value={q3} onChange={e => setQ3(e.target.value)} required rows="4" style={inputStyle} />

        <label style={labelStyle}>4. Assessment Methods</label>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#718096' }}>Are the proposed assessment methods appropriate for demonstrating true competency in this field?</p>
        <textarea value={q4} onChange={e => setQ4(e.target.value)} required rows="4" style={inputStyle} />

        <button type="submit" style={{ background: '#3182ce', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1.1em' }}>
          Submit Official Feedback
        </button>
      </form>
    </div>
  );
}