import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import './App.css'

import Login from './components/Login.jsx'
import DashboardHeader from './components/DashboardHeader.jsx'
import StatusHud from './components/StatusHud.jsx'
import WalkthroughReport from './components/WalkthroughReport.jsx'
import RtoManagerDashboard from './components/RtoManagerDashboard.jsx'
import UnitMatrixTab from './components/tabs/UnitMatrixTab.jsx'
import LearnerProfileTab from './components/tabs/LearnerProfileTab.jsx'
import LogisticsTab from './components/tabs/LogisticsTab.jsx'
import ResourcesTab from './components/tabs/ResourcesTab.jsx'
import AssessmentTab from './components/tabs/AssessmentTab.jsx'
import TrainersTab from './components/tabs/TrainersTab.jsx'
import IndustryEngagementTab from './components/tabs/IndustryEngagementTab.jsx'
import PublicReviewForm from './components/PublicReviewForm.jsx'

function App() {
  // Automatically switches between your local backend and live Render backend
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:8000"
    : "https://tas-backend-7t7y.onrender.com"; 

  const urlParams = new URLSearchParams(window.location.search);
  const reviewTasId = urlParams.get('review');
  const reviewEmail = urlParams.get('email');

  if (reviewTasId) {
    return <PublicReviewForm tasId={reviewTasId} initialEmail={reviewEmail} />
  }

  // Auth & Recovery State
  const [session, setSession] = useState(null)
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  
  // Navigation State on Home screen
  const [homeViewMode, setHomeViewMode] = useState('wizard')

  const [existingTasDocs, setExistingTasDocs] = useState([])
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [productSearchResults, setProductSearchResults] = useState([])
  const [selectedProductCode, setSelectedProductCode] = useState('')
  const [selectedProductTitle, setSelectedProductTitle] = useState('')
  
  const [tasNameInput, setTasNameInput] = useState('Standard Delivery')
  const [activeTasMeta, setActiveTasMeta] = useState({ name: '', version: '' })

  const [activeTasId, setActiveTasId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUnitCode, setSelectedUnitCode] = useState('')
  const [supervisedHours, setSupervisedHours] = useState('')
  const [unsupervisedHours, setUnsupervisedHours] = useState('')
  const [clusterName, setClusterName] = useState('Cluster 1')
  const [isClustered, setIsClustered] = useState(false)

  const [tasUnits, setTasUnits] = useState([])
  const [calculation, setCalculation] = useState(null)
  const [message, setMessage] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('matrix')

  const [learnerProfile, setLearnerProfile] = useState({
    employment_status: '', reason_for_learning: '', industry_experience: '',
    acsf_learning: 0, acsf_reading: 0, acsf_writing: 0, acsf_oral: 0, acsf_numeracy: 0, acsf_digital: 0
  })

  const [strategyDetails, setStrategyDetails] = useState({
    delivery_logistics: '', training_rationale: '', resource_requirements: '', evaluation_strategy: {},
    assessment_methods: [], assessment_rationale: '', trainer_allocations: {}, trainer_requirements: '',
    industry_engagements: [], delivery_methods: '', special_requirements: '', student_support: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    
    // Listen for auth events, specifically intercepting password recovery links
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true)
      }
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    }
  }

  // Handle saving the newly typed password to Supabase
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      alert("Error updating password: " + error.message)
    } else {
      alert("Password updated successfully! You will now be redirected to your dashboard.")
      setNewPassword('')
      setIsRecoveringPassword(false)
    }
  }

  useEffect(() => {
    if (!session || isRecoveringPassword) return;
    fetch(`${API_URL}/tas`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExistingTasDocs(data);
        else setExistingTasDocs([]);
      })
      .catch(err => console.error("Error loading TAS history:", err))
  }, [activeTasId, session, isRecoveringPassword])

  useEffect(() => {
    if (productSearchQuery.trim().length < 2) return setProductSearchResults([])
    const timer = setTimeout(() => {
      fetch(`${API_URL}/products/search?query=${productSearchQuery}`)
        .then(res => res.json())
        .then(data => setProductSearchResults(data.filter((item, index, self) => index === self.findIndex((t) => t.code === item.code))))
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearchQuery])

  useEffect(() => {
    if (searchQuery.trim().length < 2) return setSearchResults([])
    const timer = setTimeout(() => {
      fetch(`${API_URL}/units/search?query=${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          const unitsWithTitles = data.filter(unit => 
            unit.unit_title && 
            unit.unit_title.trim() !== '' &&
            unit.unit_title !== 'Title Unavailable' &&
            unit.unit_title.toLowerCase() !== 'null'
          );
          setSearchResults(unitsWithTitles);
        })
        .catch(err => console.error("Error searching units:", err));
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // INTERCEPT: Show Password Update Form if recovering
  if (isRecoveringPassword) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#edf2f7' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2d3748' }}>Reset Your Password</h2>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9em', marginBottom: '25px' }}>Please enter your new password below.</p>
          <form onSubmit={handleUpdatePassword}>
            <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>New Password:</label>
            <input 
              type="password" 
              placeholder="Minimum 6 characters"
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px', margin: '8px 0 20px 0', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} 
              required 
              minLength="6"
            />
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' }}>
              Save New Password
            </button>
          </form>
        </div>
      </div>
    )
  }

  // IF NOT LOGGED IN, SHOW LOGIN SCREEN
  if (!session) {
    return <Login />
  }

  const handleCreateTas = (e) => {
    e.preventDefault();
    if (!selectedProductCode || !selectedProductTitle) {
      return setMessage("Enter both a qualification code and title.");
    }
    
    setMessage("Creating Strategy Blueprint... Please wait.");

    fetch(`${API_URL}/products`, {
      method: 'POST', 
      headers: getAuthHeaders(),
      body: JSON.stringify({ code: selectedProductCode, title: selectedProductTitle })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to save qualification product.");
      return res.json();
    })
    .then(() => {
      return fetch(`${API_URL}/tas`, {
        method: 'POST', 
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: selectedProductCode, delivery_mode: "To be determined", tas_name: tasNameInput, version: "1.0" })
      });
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to create TAS blueprint record.");
      return res.json();
    })
    .then(data => {
      const newId = data[0]?.id || data.id;
      if (!newId) throw new Error("No valid ID returned from database.");
      
      setActiveTasId(newId);
      setActiveTasMeta({ name: tasNameInput, version: '1.0' });
      setMessage("New TAS Blueprint created!");
      
      setTasUnits([]);
      setLearnerProfile({ employment_status: '', reason_for_learning: '', industry_experience: '', acsf_learning: 0, acsf_reading: 0, acsf_writing: 0, acsf_oral: 0, acsf_numeracy: 0, acsf_digital: 0 });
      setStrategyDetails({ delivery_logistics: '', training_rationale: '', resource_requirements: '', evaluation_strategy: {}, assessment_methods: [], assessment_rationale: '', trainer_allocations: {}, trainer_requirements: '', industry_engagements: [], delivery_methods: '', special_requirements: '', student_support: '' });
      
      fetchTasData(newId);
    })
    .catch(err => {
      console.error("Creation error:", err);
      setMessage("Server connection failed or unauthorized.");
    });
  }

  const handleResumeTas = (doc) => {
    setSelectedProductCode(doc.product_id)
    setSelectedProductTitle("Loaded Qualification")
    setActiveTasMeta({ name: doc.tas_name || 'Standard Delivery', version: doc.version || '1.0' })
    setActiveTasId(doc.id)
    setMessage("Existing TAS loaded successfully.")
    fetchTasData(doc.id)
  }

  const handleDeleteTas = (e, tasId) => {
    e.stopPropagation() 
    if (window.confirm("Are you sure you want to delete this TAS? This will permanently erase all units, profile data, and strategy details attached to it.")) {
      fetch(`${API_URL}/tas/${tasId}`, { 
        method: 'DELETE',
        headers: getAuthHeaders() 
      })
      .then(res => { 
        if (!res.ok) throw new Error("Failed to delete. You may need Admin privileges."); 
        return res.json() 
      })
      .then(() => {
        setMessage("TAS deleted successfully.")
        setExistingTasDocs(prev => prev.filter(doc => doc.id !== tasId))
        if (activeTasId === tasId) setActiveTasId(null)
      }).catch(err => { 
        console.error(err); 
        setMessage("Error deleting TAS. Only Admins can delete a whole Strategy Blueprint.") 
      })
    }
  }

  const fetchTasData = async (tasId) => {
    fetch(`${API_URL}/tas/${tasId}/calculate`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { if (!data.detail) setCalculation(data) });

    fetch(`${API_URL}/tas/${tasId}/learner_profile`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { if (data && !data.detail && Object.keys(data).length > 0) setLearnerProfile(data) });

    fetch(`${API_URL}/tas/${tasId}/strategy_details`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => { if (data && !data.detail && Object.keys(data).length > 0) setStrategyDetails(data) });

    try {
      const [unitsRes, stratsRes] = await Promise.all([
        fetch(`${API_URL}/tas/${tasId}/units`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/tas/${tasId}/cluster_strategies`, { headers: getAuthHeaders() })
      ]);
      
      const unitsData = await unitsRes.json();
      const stratsData = await stratsRes.json();

      const safeUnitsData = Array.isArray(unitsData) ? unitsData : [];
      const safeStratsData = Array.isArray(stratsData) ? stratsData : [];

      if (safeUnitsData.length > 0) {
        safeUnitsData.sort((a, b) => {
          const cNameA = (!a.cluster_name || a.cluster_name === "Standalone") ? `Standalone: ${a.unit_code}` : a.cluster_name;
          const cNameB = (!b.cluster_name || b.cluster_name === "Standalone") ? `Standalone: ${b.unit_code}` : b.cluster_name;
          
          const stratA = safeStratsData.find(s => s.cluster_name === cNameA);
          const stratB = safeStratsData.find(s => s.cluster_name === cNameB);
          
          const seqA = stratA && stratA.sequence_order !== undefined ? stratA.sequence_order : 999;
          const seqB = stratB && stratB.sequence_order !== undefined ? stratB.sequence_order : 999;
          
          return seqA - seqB;
        });
      }
      
      setTasUnits(safeUnitsData);
    } catch (err) {
      console.error("Error fetching units and strategies:", err);
    }
  }

  const handleAddUnit = (e) => {
    e.preventDefault()
    if (!activeTasId || !selectedUnitCode) return
    const finalClusterName = isClustered ? (clusterName || 'Unnamed Cluster') : 'Standalone'

    fetch(`${API_URL}/tas/${activeTasId}/units`, {
      method: 'POST', 
      headers: getAuthHeaders(),
      body: JSON.stringify({ unit_code: selectedUnitCode, supervised_hours: parseFloat(supervisedHours) || 0, unsupervised_hours: parseFloat(unsupervisedHours) || 0, cluster_name: finalClusterName })
    }).then(() => {
      setMessage(`Unit ${selectedUnitCode} added.`)
      setTasUnits(prev => [...prev, { unit_code: selectedUnitCode, supervised_hours: parseFloat(supervisedHours) || 0, unsupervised_hours: parseFloat(unsupervisedHours) || 0, cluster_name: finalClusterName }])
      setSelectedUnitCode(''); setSearchQuery(''); setSupervisedHours(''); setUnsupervisedHours('')
      fetchTasData(activeTasId)
    }).catch(() => setMessage("Failed to add unit. Unauthorized."))
  }

  const handleDeleteUnit = (unitCode) => {
    if (!window.confirm(`Are you sure you want to remove ${unitCode}?`)) return
    
    fetch(`${API_URL}/tas/${activeTasId}/units/${unitCode}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete unit")
      return res.json()
    })
    .then(() => {
      setMessage(`Unit ${unitCode} removed.`)
      setTasUnits(prev => prev.filter(u => u.unit_code !== unitCode))
      
      setStrategyDetails(prev => {
        const newMapping = { ...(prev.trainer_allocations?.mapping || {}) }
        delete newMapping[unitCode]
        return { ...prev, trainer_allocations: { ...prev.trainer_allocations, mapping: newMapping } }
      })
      
      fetchTasData(activeTasId)
    })
    .catch(err => {
      console.error(err)
      setMessage("Error deleting unit. Unauthorized.")
    })
  }

  const handleMoveCluster = async (clusterNameKey, direction) => {
    const grouped = {};
    tasUnits.forEach(u => {
      const cName = (!u.cluster_name || u.cluster_name === "Standalone") ? `Standalone: ${u.unit_code}` : u.cluster_name;
      if (!grouped[cName]) grouped[cName] = [];
    });
    const clusterKeys = Object.keys(grouped);

    const index = clusterKeys.indexOf(clusterNameKey);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= clusterKeys.length) return;

    const temp = clusterKeys[index];
    clusterKeys[index] = clusterKeys[targetIndex];
    clusterKeys[targetIndex] = temp;

    let existingStrats = [];
    try {
      const res = await fetch(`${API_URL}/tas/${activeTasId}/cluster_strategies`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) existingStrats = data;
    } catch (e) {
      console.error("Could not fetch existing strategies for sequence update.");
    }

    for (let seqIdx = 0; seqIdx < clusterKeys.length; seqIdx++) {
      const cKey = clusterKeys[seqIdx];
      const existing = existingStrats.find(s => s.cluster_name === cKey) || {};
      
      const payload = {
        cluster_name: cKey,
        delivery_methods: existing.delivery_methods || [],
        assessment_methods: existing.assessment_methods || [],
        assessment_rationale: existing.assessment_rationale || "",
        resource_requirements: existing.resource_requirements || "",
        sequence_order: seqIdx
      };

      await fetch(`${API_URL}/tas/${activeTasId}/cluster_strategies`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      }).catch(err => console.error("Error updating sequence:", err));
    }

    fetchTasData(activeTasId);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault()
    fetch(`${API_URL}/tas/${activeTasId}/learner_profile`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(learnerProfile) }).then(() => setMessage("Learner Profile saved successfully!")).catch(() => setMessage("Failed to save. Unauthorized."))
  }
  
  const handleSaveDetails = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetch(`${API_URL}/tas/${activeTasId}/strategy_details`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(strategyDetails) }).then(() => setMessage("Strategy Details saved successfully!")).catch(() => setMessage("Failed to save. Unauthorized."))
  }

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1em', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#4a5568' }

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '1100px', margin: '0 auto', color: '#2c3e50', position: 'relative' }}>
      
      {/* Sign Out Button */}
      <button 
        onClick={() => supabase.auth.signOut()} 
        style={{ position: 'absolute', top: '15px', right: '30px', background: 'transparent', border: 'none', color: '#718096', cursor: 'pointer', textDecoration: 'underline' }}>
        Sign Out ({session.user.email})
      </button>

      <DashboardHeader activeTasId={activeTasId} isPreviewMode={isPreviewMode} setIsPreviewMode={setIsPreviewMode} />
      {message && <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '12px', borderRadius: '4px', marginBottom: '20px', color: '#2b6cb0' }}>{message}</div>}

      {!activeTasId ? (
        <div>
          {/* View Switcher Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
            <button onClick={() => setHomeViewMode('wizard')} style={{ background: homeViewMode === 'wizard' ? '#3182ce' : '#edf2f7', color: homeViewMode === 'wizard' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🛠️ Create & Resume Strategy
            </button>
            <button onClick={() => setHomeViewMode('dashboard')} style={{ background: homeViewMode === 'dashboard' ? '#3182ce' : '#edf2f7', color: homeViewMode === 'dashboard' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              📊 RTO Manager Dashboard & Publishing
            </button>
          </div>

          {homeViewMode === 'dashboard' ? (
            <RtoManagerDashboard API_URL={API_URL} getAuthHeaders={getAuthHeaders} onResumeTas={handleResumeTas} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginTop: 0, color: '#2d3748' }}>Start a New Strategy</h3>
                <p style={{ fontSize: '0.85em', color: '#718096', marginBottom: '20px' }}>Select an existing qualification, or type a new code and title to add it to your database.</p>
                <form onSubmit={handleCreateTas}>
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <label style={labelStyle}>Qualification Code:</label>
                    <input type="text" placeholder="e.g. TAE40122" value={selectedProductCode} onChange={(e) => { setSelectedProductCode(e.target.value.toUpperCase()); setProductSearchQuery(e.target.value); }} required style={inputStyle} />
                    {productSearchResults.length > 0 && (
                      <ul style={{ position: 'absolute', background: 'white', border: '1px solid #cbd5e0', width: '100%', listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', zIndex: 10 }}>
                        {productSearchResults.map(prod => (
                          <li key={prod.code} onClick={() => { setSelectedProductCode(prod.code); setSelectedProductTitle(prod.title); setProductSearchResults([]); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #edf2f7' }}><strong>{prod.code}</strong>: {prod.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Qualification Title:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Certificate IV in Training and Assessment" 
                      value={selectedProductTitle} 
                      onChange={(e) => setSelectedProductTitle(e.target.value)} 
                      required 
                      style={{ ...inputStyle, background: 'white', color: '#2c3e50' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Strategy Target / Cohort Name:</label>
                    <input type="text" placeholder="e.g. Corporate Delivery, Online Paced..." value={tasNameInput} onChange={(e) => setTasNameInput(e.target.value)} required style={inputStyle} />
                  </div>

                  <button type="submit" disabled={!selectedProductCode || !selectedProductTitle} style={{ background: selectedProductCode && selectedProductTitle ? '#3182ce' : '#cbd5e0', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: selectedProductCode && selectedProductTitle ? 'pointer' : 'not-allowed', fontWeight: '600', width: '100%' }}>Create Blueprint →</button>
                </form>
              </div>

              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginTop: 0, color: '#2d3748' }}>Resume Existing Strategy</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
                  {existingTasDocs.length === 0 ? <p style={{ color: '#718096', fontStyle: 'italic' }}>No TAS documents found.</p> : existingTasDocs.map(doc => (
                    <div key={doc.id} onClick={() => handleResumeTas(doc)} style={{ border: '1px solid #cbd5e0', padding: '15px', borderRadius: '6px', cursor: 'pointer', background: '#f7fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ background: doc.status === 'Published' ? '#c6f6d5' : '#feebc8', color: doc.status === 'Published' ? '#22543d' : '#744210', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold' }}>
                            {doc.status || 'Draft'}
                          </span>
                          <strong style={{ color: '#2b6cb0', fontSize: '1.05em' }}>{doc.product_id} - {doc.tas_name || 'Standard Delivery'}</strong>
                        </div>
                        <span style={{ fontSize: '0.85em', color: '#718096' }}>Version {doc.version || '1.0'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.2em', color: '#a0aec0' }}>➔</span>
                        <button 
                          onClick={(e) => handleDeleteTas(e, doc.id)}
                          style={{ background: '#fc8181', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}
                          title="Delete this TAS"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isPreviewMode ? (
        <WalkthroughReport activeTasId={activeTasId} activeTasMeta={activeTasMeta} selectedProductCode={selectedProductCode} selectedProductTitle={selectedProductTitle} learnerProfile={learnerProfile} strategyDetails={strategyDetails} tasUnits={tasUnits} calculation={calculation} />
      ) : (
        <div>
          <div style={{ background: '#edf2f7', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85em', color: '#4a5568', fontWeight: 'bold' }}>ACTIVE QUALIFICATION - v{activeTasMeta.version}</span>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#1a365d' }}>{selectedProductCode} - {selectedProductTitle}</div>
              <div style={{ fontSize: '0.9em', color: '#718096', marginTop: '4px' }}>Target Cohort: {activeTasMeta.name}</div>
            </div>
            <button onClick={() => { setActiveTasId(null); setMessage(''); }} style={{ background: '#718096', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Close Workspace</button>
          </div>

          <StatusHud calculation={calculation} tasUnits={tasUnits} />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px', overflowX: 'auto' }}>
            <button onClick={() => setActiveTab('matrix')} style={{ background: activeTab === 'matrix' ? '#3182ce' : 'transparent', color: activeTab === 'matrix' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📚 1. Unit Matrix</button>
            <button onClick={() => setActiveTab('learner')} style={{ background: activeTab === 'learner' ? '#3182ce' : 'transparent', color: activeTab === 'learner' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🎯 2. Target Learner</button>
            <button onClick={() => setActiveTab('logistics')} style={{ background: activeTab === 'logistics' ? '#3182ce' : 'transparent', color: activeTab === 'logistics' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🚚 3. Delivery & Resources</button>
            <button onClick={() => setActiveTab('resources')} style={{ background: activeTab === 'resources' ? '#3182ce' : 'transparent', color: activeTab === 'resources' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📊 4. Evaluation</button>
            <button onClick={() => setActiveTab('assessment')} style={{ background: activeTab === 'assessment' ? '#3182ce' : 'transparent', color: activeTab === 'assessment' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📋 5. Assessment</button>
            <button onClick={() => setActiveTab('trainers')} style={{ background: activeTab === 'trainers' ? '#3182ce' : 'transparent', color: activeTab === 'trainers' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🧑‍🏫 6. Trainers</button>
            <button onClick={() => setActiveTab('industry')} style={{ background: activeTab === 'industry' ? '#3182ce' : 'transparent', color: activeTab === 'industry' ? 'white' : '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🤝 7. Industry</button>
          </div>

          {activeTab === 'matrix' && <UnitMatrixTab isClustered={isClustered} setIsClustered={setIsClustered} clusterName={clusterName} setClusterName={setClusterName} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} setSearchResults={setSearchResults} selectedUnitCode={selectedUnitCode} setSelectedUnitCode={setSelectedUnitCode} supervisedHours={supervisedHours} setSupervisedHours={setSupervisedHours} unsupervisedHours={unsupervisedHours} setUnsupervisedHours={setUnsupervisedHours} tasUnits={tasUnits} handleAddUnit={handleAddUnit} handleDeleteUnit={handleDeleteUnit} handleMoveCluster={handleMoveCluster} />}
          {activeTab === 'learner' && <LearnerProfileTab activeTasId={activeTasId} learnerProfile={learnerProfile} setLearnerProfile={setLearnerProfile} handleSaveProfile={handleSaveProfile} />}
          {activeTab === 'logistics' && <LogisticsTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
          {activeTab === 'resources' && <ResourcesTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
          {activeTab === 'assessment' && <AssessmentTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
          {activeTab === 'trainers' && <TrainersTab activeTasId={activeTasId} tasUnits={tasUnits} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
          {activeTab === 'industry' && <IndustryEngagementTab activeTasId={activeTasId} tasUnits={tasUnits} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
        </div>
      )}
    </div>
  )
}

export default App