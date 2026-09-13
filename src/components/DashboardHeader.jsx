import React from 'react'

export default function DashboardHeader({ activeTasId, isPreviewMode, setIsPreviewMode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '15px', marginBottom: '20px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.8em', color: '#1a365d' }}>Living TAS Dashboard</h1>
        <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '0.95em' }}>Interactive Training & Assessment Strategy Engine</p>
      </div>

      {activeTasId && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            style={{ background: isPreviewMode ? '#3182ce' : '#2b6cb0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            {isPreviewMode ? '✏️ Back to Workspace' : '👁️ Digital Walkthrough Mode'}
          </button>
          <button 
            onClick={() => window.print()} 
            style={{ background: '#4a5568', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            🖨️ Export PDF / Print
          </button>
        </div>
      )}
    </div>
  )
}