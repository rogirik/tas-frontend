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
import StudentSupportTab from './components/tabs/StudentSupportTab.jsx'
import PublicReviewForm from './components/PublicReviewForm.jsx'
import AuditLogModal from './components/AuditLogModal.jsx'

function App() {
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
  const [productType, setProductType] = useState('Qualification') // 'Qualification' | 'Skill Set' | 'Custom'
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [productSearchResults, setProductSearchResults] = useState([])
  const [selectedProductCode, setSelectedProductCode] = useState('')
  const [selectedProductTitle, setSelectedProductTitle] = useState('')

  const [tasNameInput, setTasNameInput] = useState('Standard Delivery')
  const [activeTasMeta, setActiveTasMeta] = useState({
    name: '',
    version: '',
    packaging_rules: '',
    product_type: 'Qualification'
  })

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
  const [showAuditLog, setShowAuditLog] = useState(false)

  const [learnerProfile, setLearnerProfile] = useState({
    employment_status: '', reason_for_learning: '', industry_experience: '',
    acsf_learning: 0, acsf_reading: 0, acsf_writing: 0, acsf_oral: 0, acsf_numeracy: 0, acsf_digital: 0
  })

  const [strategyDetails, setStrategyDetails] = useState({
    delivery_logistics: '', training_rationale: '', resource_requirements: '', evaluation_strategy: {},
    support_plan: {},
    assessment_methods: [], assessment_rationale: '', trainer_allocations: {}, trainer_requirements: '',
    industry_engagements: [], delivery_methods: '', special_requirements: '', student_support: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

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

  const loadExistingTasDocs = () => {
    if (!session || isRecoveringPassword) return;
    fetch(`${API_URL}/tas`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExistingTasDocs(data);
        else setExistingTasDocs([]);
      })
      .catch(err => console.error("Error loading TAS history:", err))
  }

  useEffect(() => {
    loadExistingTasDocs();
  }, [activeTasId, session, isRecoveringPassword])

  const refreshTasState = async (tasId) => {
    try {
      const res = await fetch(`${API_URL}/tas`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        setExistingTasDocs(data);
        const currentDoc = data.find(d => d.id === tasId);
        if (currentDoc) {
          setActiveTasMeta({
            name: currentDoc.tas_name || 'Standard Delivery',
            version: currentDoc.version || '1.0',
            packaging_rules: currentDoc.packaging_rules || '',
            product_type: currentDoc.product_type || 'Qualification'
          });
        }
      }
    } catch (err) {
      console.error("Failed to refresh TAS version state:", err);
    }
  }

  useEffect(() => {
    if (productType === 'Custom' || productSearchQuery.trim().length < 2) {
      return setProductSearchResults([])
    }
    const timer = setTimeout(() => {
      fetch(`${API_URL}/products/search?query=${productSearchQuery}`)
        .then(res => res.json())
        .then(data => setProductSearchResults(data.filter((item, index, self) => index === self.findIndex((t) => t.code === item.code))))
    }, 300)
    return () => clearTimeout(timer)
  }, [productSearchQuery, productType])

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

  if (isRecoveringPassword) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#edf2f7' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2d3748' }}>Reset Your Password</h2>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9em', marginBottom: '25px' }}>Please enter your new password below.</p>
          <form onSubmit={handleUpdatePassword}>
            <label style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#4a5568', display: 'block' }}>New Password:</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', margin: '8px 0 20px 0', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box', background: 'white', color: '#1e293b' }}
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

  if (!session) {
    return <Login />
  }

  const handleCreateTas = (e) => {
    e.preventDefault();

    const finalCode =
      productType === 'Custom'
        ? (selectedProductCode.trim().toUpperCase() || `CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`)
        : selectedProductCode.trim().toUpperCase();

    if (!finalCode || !selectedProductTitle.trim()) {
      return setMessage("Enter both a code and title to create your blueprint.");
    }

    setMessage("Creating Strategy Blueprint... Please wait.");

    fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code: finalCode, title: selectedProductTitle.trim() })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save training product.");
        return res.json();
      })
      .then(() => {
        return fetch(`${API_URL}/tas`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            product_id: finalCode,
            product_type: productType,
            delivery_mode: "To be determined",
            tas_name: tasNameInput,
            version: "1.0"
          })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create TAS blueprint record.");
        return res.json();
      })
      .then(data => {
        const newId = data[0]?.id || data.id;
        if (!newId) throw new Error("No valid ID returned from database.");

        setSelectedProductCode(finalCode);
        setActiveTasId(newId);
        setActiveTasMeta({
          name: tasNameInput,
          version: '1.0',
          packaging_rules: '',
          product_type: productType
        });
        setMessage("New TAS Blueprint created!");

        setTasUnits([]);
        setLearnerProfile({ employment_status: '', reason_for_learning: '', industry_experience: '', acsf_learning: 0, acsf_reading: 0, acsf_writing: 0, acsf_oral: 0, acsf_numeracy: 0, acsf_digital: 0 });
        setStrategyDetails({ delivery_logistics: '', training_rationale: '', resource_requirements: '', evaluation_strategy: {}, support_plan: {}, assessment_methods: [], assessment_rationale: '', trainer_allocations: {}, trainer_requirements: '', industry_engagements: [], delivery_methods: '', special_requirements: '', student_support: '' });

        fetchTasData(newId);
      })
      .catch(err => {
        console.error("Creation error:", err);
        setMessage("Server connection failed or unauthorized.");
      });
  }

  const handleResumeTas = (doc) => {
    setSelectedProductCode(doc.product_id)
    setSelectedProductTitle("Loaded Training Product")
    setActiveTasMeta({
      name: doc.tas_name || 'Standard Delivery',
      version: doc.version || '1.0',
      packaging_rules: doc.packaging_rules || '',
      product_type: doc.product_type || 'Qualification'
    })
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
    try {
      const calcRes = await fetch(`${API_URL}/tas/${tasId}/calculate`, { headers: getAuthHeaders() });
      const calcData = await calcRes.json();
      if (!calcData.detail) setCalculation(calcData);

      const profRes = await fetch(`${API_URL}/tas/${tasId}/learner_profile`, { headers: getAuthHeaders() });
      const profData = await profRes.json();
      if (profData && !profData.detail && Object.keys(profData).length > 0) setLearnerProfile(profData);

      const stratDetRes = await fetch(`${API_URL}/tas/${tasId}/strategy_details`, { headers: getAuthHeaders() });
      const stratDetData = await stratDetRes.json();
      if (stratDetData && !stratDetData.detail && Object.keys(stratDetData).length > 0) setStrategyDetails(stratDetData);

      const unitsRes = await fetch(`${API_URL}/tas/${tasId}/units`, { headers: getAuthHeaders() });
      const stratsRes = await fetch(`${API_URL}/tas/${tasId}/cluster_strategies`, { headers: getAuthHeaders() });

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
      console.error("Error fetching TAS data:", err);
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
      refreshTasState(activeTasId)
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
        refreshTasState(activeTasId)
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
    refreshTasState(activeTasId);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault()
    fetch(`${API_URL}/tas/${activeTasId}/learner_profile`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(learnerProfile) })
      .then(() => {
        setMessage("Learner Profile saved successfully!");
        refreshTasState(activeTasId);
      })
      .catch(() => setMessage("Failed to save. Unauthorized."))
  }

  const handleSaveDetails = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetch(`${API_URL}/tas/${activeTasId}/strategy_details`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(strategyDetails) })
      .then(() => {
        setMessage("Strategy Details saved successfully!");
        refreshTasState(activeTasId);
      })
      .catch(() => setMessage("Failed to save. Unauthorized."))
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '0.95em',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1e293b'
  }
  const labelStyle = { display: 'block', fontWeight: '600', marginBottom: '6px', color: '#334155', fontSize: '0.9em', textAlign: 'left' }

  const canSubmitNewTas =
    productType === 'Custom'
      ? Boolean(selectedProductTitle.trim())
      : Boolean(selectedProductCode.trim() && selectedProductTitle.trim());

  const typeBadgeStyle = (type) => {
    if (type === 'Skill Set') return { background: '#e9d8fd', color: '#553c9a' };
    if (type === 'Custom') return { background: '#e2e8f0', color: '#334155' };
    return { background: '#bee3f8', color: '#2b6cb0' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#1e293b', textAlign: 'left', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ padding: '24px 30px 50px 30px', maxWidth: '1120px', margin: '0 auto' }}>

        {/* Clean Top Utility Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ background: 'white', border: '1px solid #cbd5e0', color: '#475569', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85em', fontWeight: '500' }}>
            Sign Out ({session.user.email})
          </button>
        </div>

        <DashboardHeader activeTasId={activeTasId} isPreviewMode={isPreviewMode} setIsPreviewMode={setIsPreviewMode} />

        {message && (
          <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', color: '#2b6cb0', fontSize: '0.95em' }}>
            {message}
          </div>
        )}

        {!activeTasId ? (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
              <button onClick={() => setHomeViewMode('wizard')} style={{ background: homeViewMode === 'wizard' ? '#2b6cb0' : 'white', color: homeViewMode === 'wizard' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                🛠️ Create & Resume Strategy
              </button>
              <button onClick={() => setHomeViewMode('dashboard')} style={{ background: homeViewMode === 'dashboard' ? '#2b6cb0' : 'white', color: homeViewMode === 'dashboard' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                📊 RTO Manager Dashboard & Publishing
              </button>
            </div>

            {homeViewMode === 'dashboard' ? (
              <RtoManagerDashboard API_URL={API_URL} getAuthHeaders={getAuthHeaders} onResumeTas={handleResumeTas} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
                {/* Start a New Strategy Card */}
                <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '6px', color: '#0f172a', fontSize: '1.25em' }}>Start a New Strategy</h3>
                  <p style={{ fontSize: '0.88em', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
                    Choose a Qualification, Skill Set, or build a Custom Selection of units.
                  </p>

                  {/* 3-Way Strategy Type Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '5px', borderRadius: '8px' }}>
                    {[
                      { id: 'Qualification', label: '🎓 Qualification' },
                      { id: 'Skill Set', label: '🧰 Skill Set' },
                      { id: 'Custom', label: '🧩 Custom' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setProductType(tab.id);
                          setProductSearchResults([]);
                          if (tab.id === 'Custom') setSelectedProductCode('');
                        }}
                        style={{
                          padding: '9px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85em',
                          background: productType === tab.id ? 'white' : 'transparent',
                          color: productType === tab.id ? '#1e40af' : '#475569',
                          boxShadow: productType === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateTas}>
                    <div style={{ position: 'relative', marginBottom: '18px' }}>
                      <label style={labelStyle}>
                        {productType === 'Qualification' && 'Qualification Code:'}
                        {productType === 'Skill Set' && 'Skill Set Code:'}
                        {productType === 'Custom' && 'Internal Program Code (Optional):'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          productType === 'Qualification'
                            ? 'e.g. TAE40122'
                            : productType === 'Skill Set'
                              ? 'e.g. TAESS00019'
                              : 'Leave blank to auto-generate (e.g. CUSTOM-1042)'
                        }
                        value={selectedProductCode}
                        onChange={(e) => {
                          setSelectedProductCode(e.target.value.toUpperCase());
                          setProductSearchQuery(e.target.value);
                        }}
                        required={productType !== 'Custom'}
                        style={inputStyle}
                      />
                      {productSearchResults.length > 0 && productType !== 'Custom' && (
                        <ul style={{ position: 'absolute', background: 'white', border: '1px solid #cbd5e0', width: '100%', listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', zIndex: 10, borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                          {productSearchResults.map(prod => (
                            <li
                              key={prod.code}
                              onClick={() => {
                                setSelectedProductCode(prod.code);
                                setSelectedProductTitle(prod.title);
                                setProductSearchResults([]);
                              }}
                              style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #edf2f7', fontSize: '0.9em', color: '#1e293b' }}
                            >
                              <strong>{prod.code}</strong>: {prod.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <label style={labelStyle}>
                        {productType === 'Qualification' && 'Qualification Title:'}
                        {productType === 'Skill Set' && 'Skill Set Title:'}
                        {productType === 'Custom' && 'Custom Program / Short Course Title:'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          productType === 'Qualification'
                            ? 'e.g. Certificate IV in Training and Assessment'
                            : productType === 'Skill Set'
                              ? 'e.g. Assessor Skill Set'
                              : 'e.g. Workplace Safety & Induction Short Course'
                        }
                        value={selectedProductTitle}
                        onChange={(e) => setSelectedProductTitle(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <label style={labelStyle}>Strategy Target / Cohort Name:</label>
                      <input
                        type="text"
                        placeholder="e.g. Corporate Delivery, Online Paced..."
                        value={tasNameInput}
                        onChange={(e) => setTasNameInput(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmitNewTas}
                      style={{
                        background: canSubmitNewTas ? '#2b6cb0' : '#cbd5e0',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: canSubmitNewTas ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '0.95em',
                        width: '100%'
                      }}
                    >
                      Create Blueprint →
                    </button>
                  </form>
                </div>

                {/* Resume Existing Strategy Card */}
                <div style={{ background: 'white', padding: '28px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '6px', color: '#0f172a', fontSize: '1.25em' }}>Resume Existing Strategy</h3>
                  <p style={{ fontSize: '0.88em', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
                    Click any strategy below to open its unit matrix and compliance details.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {existingTasDocs.length === 0 ? (
                      <p style={{ color: '#64748b', fontStyle: 'italic' }}>No TAS documents found yet.</p>
                    ) : existingTasDocs.map(doc => {
                      const pType = doc.product_type || 'Qualification';
                      const badgeColors = typeBadgeStyle(pType);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleResumeTas(doc)}
                          style={{ border: '1px solid #cbd5e0', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ background: doc.status === 'Published' ? '#c6f6d5' : '#feebc8', color: doc.status === 'Published' ? '#22543d' : '#744210', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72em', fontWeight: 'bold' }}>
                                {doc.status || 'Draft'}
                              </span>
                              <span style={{ ...badgeColors, padding: '2px 7px', borderRadius: '4px', fontSize: '0.72em', fontWeight: 'bold' }}>
                                {pType}
                              </span>
                            </div>
                            <div style={{ color: '#1e40af', fontWeight: 'bold', fontSize: '1em', marginBottom: '2px' }}>
                              {doc.product_id} — {doc.tas_name || 'Standard Delivery'}
                            </div>
                            <span style={{ fontSize: '0.82em', color: '#64748b' }}>Version {doc.version || '1.0'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', shrink: 0 }}>
                            <span style={{ fontSize: '1.1em', color: '#94a3b8' }}>➔</span>
                            <button
                              onClick={(e) => handleDeleteTas(e, doc.id)}
                              style={{ background: '#fc8181', color: 'white', border: 'none', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' }}
                              title="Delete this TAS"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isPreviewMode ? (
          <WalkthroughReport activeTasId={activeTasId} activeTasMeta={activeTasMeta} selectedProductCode={selectedProductCode} selectedProductTitle={selectedProductTitle} learnerProfile={learnerProfile} strategyDetails={strategyDetails} tasUnits={tasUnits} calculation={calculation} API_URL={API_URL} getAuthHeaders={getAuthHeaders} />
        ) : (
          <div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ ...typeBadgeStyle(activeTasMeta.product_type), padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>
                    {activeTasMeta.product_type || 'Qualification'}
                  </span>
                  <span style={{ fontSize: '0.82em', color: '#64748b', fontWeight: 'bold' }}>VERSION {activeTasMeta.version}</span>
                </div>
                <div style={{ fontSize: '1.15em', fontWeight: 'bold', color: '#0f172a' }}>{selectedProductCode} — {selectedProductTitle}</div>
                <div style={{ fontSize: '0.88em', color: '#64748b', marginTop: '2px' }}>Target Cohort: {activeTasMeta.name}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowAuditLog(true)} style={{ background: '#2b6cb0', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>View History</button>
                <button onClick={() => { setActiveTasId(null); setMessage(''); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Close Workspace</button>
              </div>
            </div>

            <StatusHud calculation={calculation} tasUnits={tasUnits} />

            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' }}>
              <button onClick={() => setActiveTab('matrix')} style={{ background: activeTab === 'matrix' ? '#2b6cb0' : 'white', color: activeTab === 'matrix' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>📚 1. Unit Matrix</button>
              <button onClick={() => setActiveTab('learner')} style={{ background: activeTab === 'learner' ? '#2b6cb0' : 'white', color: activeTab === 'learner' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🎯 2. Target Learner</button>
              <button onClick={() => setActiveTab('support')} style={{ background: activeTab === 'support' ? '#2b6cb0' : 'white', color: activeTab === 'support' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🛡️ 3. Support</button>
              <button onClick={() => setActiveTab('logistics')} style={{ background: activeTab === 'logistics' ? '#2b6cb0' : 'white', color: activeTab === 'logistics' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🚚 4. Delivery</button>
              <button onClick={() => setActiveTab('assessment')} style={{ background: activeTab === 'assessment' ? '#2b6cb0' : 'white', color: activeTab === 'assessment' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>📋 5. Assessment</button>
              <button onClick={() => setActiveTab('resources')} style={{ background: activeTab === 'resources' ? '#2b6cb0' : 'white', color: activeTab === 'resources' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>📊 6. Evaluation</button>
              <button onClick={() => setActiveTab('trainers')} style={{ background: activeTab === 'trainers' ? '#2b6cb0' : 'white', color: activeTab === 'trainers' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🧑‍🏫 7. Trainers</button>
              <button onClick={() => setActiveTab('industry')} style={{ background: activeTab === 'industry' ? '#2b6cb0' : 'white', color: activeTab === 'industry' ? 'white' : '#475569', border: '1px solid #cbd5e0', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🤝 8. Industry</button>
            </div>

            {activeTab === 'matrix' && (
              <UnitMatrixTab
                tasId={activeTasId}
                productType={activeTasMeta.product_type}
                initialPackagingRules={activeTasMeta.packaging_rules}
                accessToken={session?.access_token}
                apiBaseUrl={API_URL}
                onSyncComplete={() => {
                  fetchTasData(activeTasId);
                  refreshTasState(activeTasId);
                }}
                isClustered={isClustered}
                setIsClustered={setIsClustered}
                clusterName={clusterName}
                setClusterName={setClusterName}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                selectedUnitCode={selectedUnitCode}
                setSelectedUnitCode={setSelectedUnitCode}
                supervisedHours={supervisedHours}
                setSupervisedHours={setSupervisedHours}
                unsupervisedHours={unsupervisedHours}
                setUnsupervisedHours={setUnsupervisedHours}
                tasUnits={tasUnits}
                handleAddUnit={handleAddUnit}
                handleDeleteUnit={handleDeleteUnit}
                handleMoveCluster={handleMoveCluster}
              />
            )}
            {activeTab === 'learner' && <LearnerProfileTab activeTasId={activeTasId} learnerProfile={learnerProfile} setLearnerProfile={setLearnerProfile} handleSaveProfile={handleSaveProfile} />}
            {activeTab === 'support' && <StudentSupportTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
            {activeTab === 'logistics' && <LogisticsTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
            {activeTab === 'assessment' && <AssessmentTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} API_URL={API_URL} getAuthHeaders={getAuthHeaders} />}
            {activeTab === 'resources' && <ResourcesTab activeTasId={activeTasId} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
            {activeTab === 'trainers' && <TrainersTab activeTasId={activeTasId} tasUnits={tasUnits} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
            {activeTab === 'industry' && <IndustryEngagementTab activeTasId={activeTasId} tasUnits={tasUnits} strategyDetails={strategyDetails} setStrategyDetails={setStrategyDetails} handleSaveDetails={handleSaveDetails} />}
          </div>
        )}

        {showAuditLog && (
          <AuditLogModal
            tasId={activeTasId}
            onClose={() => setShowAuditLog(false)}
            API_URL={API_URL}
            getAuthHeaders={getAuthHeaders}
          />
        )}
      </div>
    </div>
  )
}

export default App