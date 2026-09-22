import React, { useState } from 'react'

const presetCohorts = [
  {
    id: 1,
    icon: "🎒",
    title: "School Leavers / Entry-Level",
    demographics: "16–21 years, mixed gender, domestic students, urban and regional locations.",
    education: "Year 10–12 equivalent. No prior VET experience. High informal digital literacy (social media, mobile), but low proficiency with workplace software or LMS platforms.",
    employment: "Unemployed or engaged in casual retail/hospitality. Target career path is a licensed tradesperson or entry-level industry role.",
    motivations: "Gaining foundational practical skills, securing full-time employment, and achieving a recognized qualification.",
    support: "ACSF Level 2/3 LLN support, particularly contextualized numeracy. Benefit from highly visual, kinesthetic learning materials and practical demonstrations over text-heavy theory.",
    mapping: { employment_status: "School leaver", reason_for_learning: "Personal interest or self-improvement", industry_experience: "New entrant (No prior industry experience)", acsf_learning: 2, acsf_reading: 3, acsf_writing: 2, acsf_oral: 3, acsf_numeracy: 2 }
  },
  {
    id: 2,
    icon: "💼",
    title: "Mature Career Transitioners",
    demographics: "30–50+ years, diverse cultural backgrounds, predominantly urban/suburban locations.",
    education: "May hold outdated qualifications. Moderate prior VET experience. Competent digital literacy for standard web browsing and email.",
    employment: "Employed in unrelated, often declining sectors. Target career path is shifting into high-demand industries.",
    motivations: "Seeking stable employment, better work-life balance, or a more meaningful career trajectory.",
    support: "Flexible delivery schedules to balance work and caring responsibilities. Refresher support for academic writing, study skills, and LMS navigation.",
    mapping: { employment_status: "Employed in a different industry (Career transition)", reason_for_learning: "Career transition into a new industry", industry_experience: "Limited experience (Entry-level, under 1 year)", acsf_learning: 3, acsf_reading: 3, acsf_writing: 3, acsf_oral: 4, acsf_numeracy: 3 }
  },
  {
    id: 3,
    icon: "🌍",
    title: "CALD / Skilled Migrants",
    demographics: "25–45 years, CALD backgrounds, primarily urban locations.",
    education: "Often hold overseas higher education degrees. Limited Australian VET experience. Strong technical and digital literacy skills.",
    employment: "Underemployed or working in the gig economy. Target career path is local industry recognition in their pre-existing professional field.",
    motivations: "Gaining Australian-recognized qualifications to map to overseas experience and meet local licensing requirements.",
    support: "Targeted LLN support focused on Australian workplace vernacular, industry-specific idioms, and local compliance frameworks.",
    mapping: { employment_status: "Pre-employment / Job seeker", reason_for_learning: "Seeking formal recognition of existing uncertified skills", industry_experience: "Experienced in a related field (Transferable skills)", acsf_learning: 4, acsf_reading: 3, acsf_writing: 3, acsf_oral: 3, acsf_numeracy: 4 }
  },
  {
    id: 4,
    icon: "📈",
    title: "Existing Worker Upskilling",
    demographics: "35–55 years, mixed gender, urban and regional locations.",
    education: "Hold various prior VET or higher education qualifications. High digital literacy in standard workplace software.",
    employment: "Currently employed in supervisory or mid-level roles. Target career path is senior management or executive leadership.",
    motivations: "Career advancement, meeting internal promotion requirements, and formalizing existing management skills.",
    support: "Minimal traditional LLN needs. Strong preference for Recognition of Prior Learning (RPL) pathways, self-paced delivery, and complex, workplace-simulated assessments.",
    mapping: { employment_status: "Employed in the industry (Full-time/Part-time)", reason_for_learning: "Upskilling for current role or promotion", industry_experience: "Significant experience (Extensive practical skills)", acsf_learning: 4, acsf_reading: 4, acsf_writing: 4, acsf_oral: 4, acsf_numeracy: 4 }
  },
  {
    id: 5,
    icon: "🏡",
    title: "Return-to-Work Parents",
    demographics: "30–50 years, predominantly female, urban and regional locations.",
    education: "High school completion or outdated entry-level qualifications. Basic to moderate digital literacy.",
    employment: "Long-term unemployed due to caring duties. Target career path is entry-to-mid level administrative, education, or care roles.",
    motivations: "Achieving financial independence and re-entering the workforce with modernized, relevant skills.",
    support: "Confidence-building, clear task scaffolding, and digital literacy support for online learning. Require flexible timetabling aligned with school hours.",
    mapping: { employment_status: "Pre-employment / Job seeker", reason_for_learning: "Career transition into a new industry", industry_experience: "New entrant (No prior industry experience)", acsf_learning: 3, acsf_reading: 3, acsf_writing: 3, acsf_oral: 4, acsf_numeracy: 3 }
  },
  {
    id: 6,
    icon: "🧩",
    title: "Neurodivergent Learners",
    demographics: "18–35 years, diverse backgrounds, urban and regional locations.",
    education: "Varied education levels, potentially with disrupted prior schooling. Digital literacy ranges from moderate to highly advanced in specific niche software.",
    employment: "Varied (unemployed to part-time). Target career path is often specialized roles (e.g., IT, digital design, specialized trades).",
    motivations: "Securing a qualification in a high-interest field within a supportive, structured environment.",
    support: "Reasonable adjustments including chunked assessments with micro-deadlines, explicit and literal rubrics, alternative assessment methods (verbal vs. written), and sensory-friendly learning options.",
    mapping: { employment_status: "Pre-employment / Job seeker", reason_for_learning: "Personal interest or self-improvement", industry_experience: "Limited experience (Entry-level, under 1 year)", acsf_learning: 3, acsf_reading: 3, acsf_writing: 3, acsf_oral: 3, acsf_numeracy: 3 }
  },
  {
    id: 7,
    icon: "🚜",
    title: "Regional / Remote Workers",
    demographics: "20–60 years, predominantly male, regional and remote locations.",
    education: "Year 10–11 equivalent, potentially holding lower-level VET (Cert II). Lower workplace digital literacy.",
    employment: "Employed in agriculture, mining, or regional trades. Target career path is supervisory roles or meeting strict compliance/WHS mandates.",
    motivations: "Meeting regulatory/licensing requirements or preparing to take over family businesses.",
    support: "Reading/writing LLN support (ACSF Level 3). Require low-bandwidth/offline resources, block-release practical sessions, and practical observation over written assignments.",
    mapping: { employment_status: "Employed in the industry (Full-time/Part-time)", reason_for_learning: "Mandatory regulatory or licensing requirement", industry_experience: "Moderate experience (1-3 years, requires formalization)", acsf_learning: 2, acsf_reading: 2, acsf_writing: 2, acsf_oral: 3, acsf_numeracy: 3 }
  },
  {
    id: 8,
    icon: "🛠️",
    title: "Unrecognized Experts (RPL)",
    demographics: "40–60+ years, diverse backgrounds, urban and regional locations.",
    education: "Limited formal education, but decades of informal workplace training. Low to moderate digital literacy.",
    employment: "Highly experienced 'on the tools' in their current roles. Target career path is transitioning to training, WHS, or site management.",
    motivations: "Job security, industry compliance, and physically transitioning off manual labor roles.",
    support: "Heavy reliance on RPL pathways, third-party reports, and professional conversations for assessment. Require significant digital literacy support if required to use an LMS.",
    mapping: { employment_status: "Employed in the industry (Full-time/Part-time)", reason_for_learning: "Seeking formal recognition of existing uncertified skills", industry_experience: "Significant experience (Extensive practical skills)", acsf_learning: 3, acsf_reading: 2, acsf_writing: 2, acsf_oral: 4, acsf_numeracy: 3 }
  },
  {
    id: 9,
    icon: "🎓",
    title: "Recent Grads Specializing",
    demographics: "20–30 years, mixed gender, mostly urban locations.",
    education: "Recent Bachelor’s degree or Advanced Diploma. High prior education experience. Advanced digital literacy.",
    employment: "Employed in entry-level or graduate roles. Target career path is specialized, niche industry roles.",
    motivations: "Bridging the gap between theoretical degree knowledge and practical, hands-on VET skills required by employers.",
    support: "Fast-tracked delivery and challenging extension activities. May require support translating academic essay-writing styles into concise, compliant workplace reporting.",
    mapping: { employment_status: "Employed in a different industry (Career transition)", reason_for_learning: "Upskilling for current role or promotion", industry_experience: "New entrant (No prior industry experience)", acsf_learning: 5, acsf_reading: 5, acsf_writing: 4, acsf_oral: 4, acsf_numeracy: 4 }
  },
  {
    id: 10,
    icon: "⚖️",
    title: "Compliance & Regulatory",
    demographics: "25–50 years, diverse backgrounds, predominantly urban locations.",
    education: "Often highly educated. High digital literacy.",
    employment: "Working in highly regulated industries (e.g., finance, real estate, health). Target career path involves maintaining professional registration or local licensing.",
    motivations: "Mandatory compliance and updating knowledge on current Australian legislation and industry standards.",
    support: "Gap training focus. Require highly contextualized case studies reflecting current laws. Flexible, asynchronous online delivery is essential to fit around full-time professional work.",
    mapping: { employment_status: "Employed in the industry (Full-time/Part-time)", reason_for_learning: "Mandatory regulatory or licensing requirement", industry_experience: "Experienced in a related field (Transferable skills)", acsf_learning: 4, acsf_reading: 4, acsf_writing: 4, acsf_oral: 4, acsf_numeracy: 4 }
  }
];

export default function LearnerProfileTab({ activeTasId, learnerProfile, setLearnerProfile, handleSaveProfile }) {
  const [showModal, setShowModal] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  
  // Track multiple selected profiles locally
  const [selectedIds, setSelectedIds] = useState([]);

  const handleChange = (field, value) => {
    setLearnerProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleCardToggle = (cohort) => {
    let newSelectedIds;
    
    // Toggle logic: Add or remove from array
    if (selectedIds.includes(cohort.id)) {
      newSelectedIds = selectedIds.filter(id => id !== cohort.id);
    } else {
      newSelectedIds = [...selectedIds, cohort.id];
    }
    
    setSelectedIds(newSelectedIds);

    // Auto-calculate the overarching profile based on ALL selected cohorts
    if (newSelectedIds.length > 0) {
      const activeCohorts = presetCohorts.filter(c => newSelectedIds.includes(c.id));
      const primaryCohort = activeCohorts[activeCohorts.length - 1]; // Use the most recent for standard dropdowns
      
      // Compliance requires meeting the highest support need (max ACSF) among a mixed cohort
      const maxACSF = {
        acsf_learning: Math.max(...activeCohorts.map(c => c.mapping.acsf_learning)),
        acsf_reading: Math.max(...activeCohorts.map(c => c.mapping.acsf_reading)),
        acsf_writing: Math.max(...activeCohorts.map(c => c.mapping.acsf_writing)),
        acsf_oral: Math.max(...activeCohorts.map(c => c.mapping.acsf_oral)),
        acsf_numeracy: Math.max(...activeCohorts.map(c => c.mapping.acsf_numeracy)),
      };

      setLearnerProfile(prev => ({
        ...prev,
        employment_status: primaryCohort.mapping.employment_status,
        reason_for_learning: primaryCohort.mapping.reason_for_learning,
        industry_experience: primaryCohort.mapping.industry_experience,
        ...maxACSF
      }));
    }
  }

  const openDetails = (e, cohort) => {
    e.stopPropagation(); // Prevents the card from toggling when clicking "Details"
    setActivePreset(cohort);
    setShowModal(true);
  }

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', marginBottom: '15px', backgroundColor: 'white' }
  const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#4a5568' }
  
  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#2d3748' }}>Select Preset Cohort Profiles</h3>
            <p style={{ margin: 0, fontSize: '0.85em', color: '#718096' }}>Click to select one or multiple cohorts. ACSF levels will automatically scale to support the highest need.</p>
          </div>
          {selectedIds.length > 0 && (
            <span style={{ background: '#e6fffa', color: '#234e52', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', border: '1px solid #81e6d9' }}>
              {selectedIds.length} Cohort{selectedIds.length > 1 ? 's' : ''} Blended
            </span>
          )}
        </div>
        
        {/* Visual Grid of Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
          {presetCohorts.map(cohort => {
            const isSelected = selectedIds.includes(cohort.id);
            return (
              <div 
                key={cohort.id} 
                onClick={() => handleCardToggle(cohort)}
                style={{
                  position: 'relative',
                  background: isSelected ? '#f0fff4' : '#f7fafc',
                  border: isSelected ? '2px solid #38a169' : '1px solid #cbd5e0',
                  borderRadius: '8px',
                  padding: '15px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '120px',
                  boxShadow: isSelected ? '0 4px 6px rgba(56, 161, 105, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Selection Checkmark */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#38a169', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    ✓
                  </div>
                )}
                
                <div style={{ fontSize: '2em', marginBottom: '8px' }}>{cohort.icon}</div>
                <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: isSelected ? '#22543d' : '#2c3e50', lineHeight: '1.2', marginBottom: '10px' }}>{cohort.title}</div>
                
                <button 
                  onClick={(e) => openDetails(e, cohort)}
                  style={{ background: 'transparent', border: 'none', color: '#3182ce', fontSize: '0.75em', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  View Details
                </button>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Modal Popup (View Details Only) */}
      {showModal && activePreset && (
        <div style={{ position: 'absolute', top: '5%', left: '5%', right: '5%', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 50, border: '2px solid #3182ce' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <span style={{ fontSize: '2.5em' }}>{activePreset.icon}</span>
            <h2 style={{ margin: 0, color: '#2b6cb0' }}>{activePreset.title}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '0.95em', color: '#4a5568', lineHeight: '1.5' }}>
            <div>
              <strong style={{ color: '#2d3748' }}>Demographics:</strong> <p style={{ margin: '5px 0 15px 0' }}>{activePreset.demographics}</p>
              <strong style={{ color: '#2d3748' }}>Education History:</strong> <p style={{ margin: '5px 0 15px 0' }}>{activePreset.education}</p>
              <strong style={{ color: '#2d3748' }}>Employment Background:</strong> <p style={{ margin: '5px 0 15px 0' }}>{activePreset.employment}</p>
            </div>
            <div>
              <strong style={{ color: '#2d3748' }}>Motivations:</strong> <p style={{ margin: '5px 0 15px 0' }}>{activePreset.motivations}</p>
              <strong style={{ color: '#2d3748' }}>Support Needs:</strong> <p style={{ margin: '5px 0 15px 0' }}>{activePreset.support}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button onClick={() => setShowModal(false)} style={{ background: '#edf2f7', color: '#4a5568', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}

      {/* Manual Selection Form */}
      <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#4a5568' }}>Primary Configuration & ACSF Targets</h4>
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Primary Employment Status:</label>
              <select 
                value={learnerProfile.employment_status || ''} 
                onChange={e => handleChange('employment_status', e.target.value)} 
                style={inputStyle} 
                required
              >
                <option value="" disabled>-- Select Employment Status --</option>
                <option value="Employed in the industry (Full-time/Part-time)">Employed in the industry (Full-time/Part-time)</option>
                <option value="Employed in a different industry (Career transition)">Employed in a different industry (Career transition)</option>
                <option value="Apprentice or Trainee">Apprentice or Trainee</option>
                <option value="Pre-employment / Job seeker">Pre-employment / Job seeker</option>
                <option value="School leaver">School leaver</option>
              </select>

              <label style={labelStyle}>Primary Reason for Learning:</label>
              <select 
                value={learnerProfile.reason_for_learning || ''} 
                onChange={e => handleChange('reason_for_learning', e.target.value)} 
                style={inputStyle}
                required
              >
                <option value="" disabled>-- Select Reason for Learning --</option>
                <option value="Mandatory regulatory or licensing requirement">Mandatory regulatory or licensing requirement</option>
                <option value="Upskilling for current role or promotion">Upskilling for current role or promotion</option>
                <option value="Seeking formal recognition of existing uncertified skills">Seeking formal recognition of existing uncertified skills</option>
                <option value="Career transition into a new industry">Career transition into a new industry</option>
                <option value="Personal interest or self-improvement">Personal interest or self-improvement</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Primary Industry Experience:</label>
              <select 
                value={learnerProfile.industry_experience || ''} 
                onChange={e => handleChange('industry_experience', e.target.value)} 
                style={inputStyle}
                required
              >
                <option value="" disabled>-- Select Industry Experience --</option>
                <option value="New entrant (No prior industry experience)">New entrant (No prior industry experience)</option>
                <option value="Limited experience (Entry-level, under 1 year)">Limited experience (Entry-level, under 1 year)</option>
                <option value="Moderate experience (1-3 years, requires formalization)">Moderate experience (1-3 years, requires formalization)</option>
                <option value="Significant experience (Extensive practical skills)">Significant experience (Extensive practical skills)</option>
                <option value="Experienced in a related field (Transferable skills)">Experienced in a related field (Transferable skills)</option>
              </select>
            </div>
          </div>

          <h4 style={{ color: '#2d3748', borderBottom: '1px solid #cbd5e0', paddingBottom: '10px', marginTop: '20px' }}>Australian Core Skills Framework (ACSF) Benchmarks</h4>
          <p style={{ fontSize: '0.85em', color: '#718096', marginBottom: '15px' }}>If multiple profiles are selected, these values auto-adjust to support the highest level of LLN need within the blended group.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
            {['learning', 'reading', 'writing', 'oral', 'numeracy'].map(skill => (
              <div key={skill}>
                <label style={{ ...labelStyle, textTransform: 'capitalize' }}>{skill}:</label>
                <select 
                  value={learnerProfile[`acsf_${skill}`] || 0} 
                  onChange={e => handleChange(`acsf_${skill}`, parseInt(e.target.value))}
                  style={inputStyle}
                >
                  <option value={0}>Not Set</option>
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button type="submit" style={{ background: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', width: '100%', fontSize: '1.1em' }}>
            💾 Save Profile Configuration
          </button>
        </form>
      </div>
    </div>
  )
}