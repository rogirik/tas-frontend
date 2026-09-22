import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rtoName, setRtoName] = useState('')
  const [joinRtoId, setJoinRtoId] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('login') // 'login', 'create_org', 'join_org'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (!rtoName) {
      setMessage("Please enter an Organization Name.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          rto_name: rtoName,
          role: 'admin' // The creator gets Admin privileges
        }
      }
    })

    if (error) setMessage(error.message)
    else setMessage('Success! Check your email for a confirmation link.')
    setLoading(false)
  }

  const handleJoinOrg = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (!joinRtoId) {
      setMessage("Please enter the RTO Invitation ID provided by your manager.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          rto_id: joinRtoId,
          role: 'auditor' // New staff default to read-only until an admin promotes them
        }
      }
    })

    if (error) setMessage(error.message)
    else setMessage('Success! Check your email for a confirmation link.')
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }
  const buttonStyle = { width: '100%', padding: '10px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
  const tabStyle = (active) => ({ flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', borderBottom: active ? '3px solid #3182ce' : '1px solid #cbd5e0', fontWeight: active ? 'bold' : 'normal', color: active ? '#2c3e50' : '#718096', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#edf2f7' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2d3748' }}>Living TAS Dashboard</h2>
        
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <button style={tabStyle(mode === 'login')} onClick={() => { setMode('login'); setMessage(''); }}>Log In</button>
          <button style={tabStyle(mode === 'create_org')} onClick={() => { setMode('create_org'); setMessage(''); }}>New RTO</button>
          <button style={tabStyle(mode === 'join_org')} onClick={() => { setMode('join_org'); setMessage(''); }}>Join RTO</button>
        </div>

        {message && <div style={{ padding: '10px', background: '#fed7d7', color: '#c53030', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={mode === 'login' ? handleLogin : mode === 'create_org' ? handleCreateOrg : handleJoinOrg}>
          
          {mode === 'create_org' && (
            <div>
              <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568' }}>Organization / RTO Name:</label>
              <input type="text" placeholder="e.g. Acme Training Academy" value={rtoName} onChange={e => setRtoName(e.target.value)} style={inputStyle} required />
            </div>
          )}

          {mode === 'join_org' && (
            <div>
              <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568' }}>Manager's RTO Invitation Code:</label>
              <input type="text" placeholder="Paste UUID here..." value={joinRtoId} onChange={e => setJoinRtoId(e.target.value)} style={inputStyle} required />
            </div>
          )}

          <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', marginTop: '10px', display: 'block' }}>Email Address:</label>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          
          <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', marginTop: '10px', display: 'block' }}>Password:</label>
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
          
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : mode === 'create_org' ? 'Register New RTO' : 'Join Existing RTO'}
          </button>
        </form>
      </div>
    </div>
  )
}