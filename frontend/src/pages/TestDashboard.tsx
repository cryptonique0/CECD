import { useMemo, useState } from 'react';

export default function TestDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'report' | 'volunteer' | 'incidents'>('dashboard');
  const [incidents, setIncidents] = useState([
    { id: 1, title: 'Fire Emergency', category: 'Fire', severity: 'High', location: 'Downtown', timestamp: '2025-12-26 10:30' },
    { id: 2, title: 'Medical Emergency', category: 'Medical', severity: 'Medium', location: 'Hospital Area', timestamp: '2025-12-26 09:15' },
  ]);
  // Report Incident form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Other');
  const [reportSeverity, setReportSeverity] = useState('Medium');
  const [reportLocation, setReportLocation] = useState('');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleConnect = async () => {
    console.log('Connect button clicked');
    setLoading(true);
    
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to connect your wallet');
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0]);
        setIsConnected(true);
        console.log('Wallet connected:', accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    const handleReportIncident = () => {
      setActiveView('report');
    };

    const handleRegisterVolunteer = () => {
      const name = prompt('Enter your name:');
      if (name) {
        alert(`${name}, you have been registered as a volunteer!\n\nYou will receive notifications about incidents in your area.`);
        setActiveView('dashboard');
      }
    };

    const handleViewIncidents = () => {
      setActiveView('incidents');
    };

  const onFilesSelected = (filesList: FileList | null) => {
    setReportError(null);
    if (!filesList || filesList.length === 0) {
      setReportFiles([]);
      return;
    }
    const files = Array.from(filesList).slice(0, 10);
    setReportFiles(files);
  };

  const previewAttachments = useMemo(() => {
    return reportFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/')
    }));
  }, [reportFiles]);

  const submitIncident = () => {
    setReportError(null);
    if (!reportTitle.trim()) {
      setReportError('Title is required.');
      return;
    }
    const newIncident = {
      id: incidents.length + 1,
      title: reportTitle.trim(),
      category: reportCategory,
      severity: reportSeverity,
      location: reportLocation.trim() || 'Unspecified',
      timestamp: new Date().toLocaleString(),
      attachments: previewAttachments
    };
    setIncidents([newIncident, ...incidents]);
    // Reset form
    setReportTitle('');
    setReportCategory('Other');
    setReportSeverity('Medium');
    setReportLocation('');
    setReportFiles([]);
    setActiveView('incidents');
    alert('Incident reported successfully!');
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>Community Emergency Coordination Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Smart Contract: 0x05228Bba13D6B2BeDF97a7aaA729a962Bd8971BF</p>
        
        {isConnected ? (
          <>
            <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '10px' }}>✓ Wallet Connected</p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px', wordBreak: 'break-all' }}>
              Address: {userAddress}
            </p>

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActiveView('dashboard')}
                  style={{
                    background: activeView === 'dashboard' ? '#3b82f6' : '#f3f4f6',
                    color: activeView === 'dashboard' ? 'white' : '#333',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleReportIncident}
                  style={{
                    background: activeView === 'report' ? '#3b82f6' : '#f3f4f6',
                    color: activeView === 'report' ? 'white' : '#333',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Report Incident
                </button>
                <button 
                  onClick={handleRegisterVolunteer}
                  style={{
                    background: activeView === 'volunteer' ? '#10b981' : '#f3f4f6',
                    color: activeView === 'volunteer' ? 'white' : '#333',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Register Volunteer
                </button>
                <button 
                  onClick={handleViewIncidents}
                  style={{
                    background: activeView === 'incidents' ? '#f59e0b' : '#f3f4f6',
                    color: activeView === 'incidents' ? 'white' : '#333',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Incidents ({incidents.length})
                </button>
              </div>

              {/* Dashboard View */}
              {activeView === 'dashboard' && (
                <div>
                  <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Dashboard Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Total Incidents</p>
                    <p style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>{incidents.length}</p>
                </div>
                <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Active Volunteers</p>
                    <p style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>3</p>
                </div>
                <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Announcements</p>
                    <p style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>2</p>
                </div>
              </div>

              <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px', marginTop: '20px' }}>Features</h3>
              <ul style={{ color: '#666', lineHeight: '1.8', marginLeft: '0', paddingLeft: '20px' }}>
                <li>Report Emergency Incidents</li>
                <li>Register as Volunteer</li>
                <li>Real-time Alerts & Notifications</li>
                <li>Community Announcements</li>
                <li>Incident Analytics & Reporting</li>
              </ul>
                </div>
              )}

              {/* Report Incident View */}
              {activeView === 'report' && (
                <div>
                  <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Report Incident</h2>
                  {reportError && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                      {reportError}
                    </div>
                  )}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', marginBottom: '6px' }}>Title *</label>
                      <input
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        placeholder="e.g. Fire at Elm Street"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#374151', marginBottom: '6px' }}>Category</label>
                        <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                          <option>Fire</option>
                          <option>Medical</option>
                          <option>Flood</option>
                          <option>Crime</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#374151', marginBottom: '6px' }}>Severity</label>
                        <select value={reportSeverity} onChange={(e) => setReportSeverity(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', marginBottom: '6px' }}>Location</label>
                      <input
                        value={reportLocation}
                        onChange={(e) => setReportLocation(e.target.value)}
                        placeholder="e.g. Downtown, Building 12"
                        style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#374151', marginBottom: '6px' }}>Attachments (images or videos)</label>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(e) => onFilesSelected(e.target.files)}
                      />
                      {previewAttachments.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                          {previewAttachments.map((att) => (
                            <div key={att.url} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px' }}>
                              <div style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', wordBreak: 'break-all' }}>{att.name}</div>
                              {att.isVideo ? (
                                <div style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '12px', padding: '20px', textAlign: 'center', borderRadius: '4px' }}>Video selected</div>
                              ) : (
                                <img src={att.url} alt={att.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button onClick={submitIncident} style={{ background: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Submit Report</button>
                      <button onClick={() => setActiveView('dashboard')} style={{ background: '#f3f4f6', color: '#111827', padding: '10px 15px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Incidents View */}
              {activeView === 'incidents' && (
                <div>
                  <h2 style={{ color: '#333', fontSize: '20px', marginBottom: '15px' }}>Active Incidents</h2>
                  {incidents.length === 0 ? (
                    <p style={{ color: '#666' }}>No incidents reported.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {incidents.map((incident) => (
                        <div key={incident.id} style={{ background: '#f3f4f6', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                          <h3 style={{ color: '#333', marginTop: 0, marginBottom: '8px' }}>{incident.title}</h3>
                          <p style={{ color: '#666', fontSize: '14px', margin: '4px 0' }}><strong>Category:</strong> {incident.category}</p>
                          <p style={{ color: '#666', fontSize: '14px', margin: '4px 0' }}><strong>Severity:</strong> {incident.severity}</p>
                          <p style={{ color: '#666', fontSize: '14px', margin: '4px 0' }}><strong>Location:</strong> {incident.location}</p>
                          <p style={{ color: '#999', fontSize: '12px', margin: '8px 0 0 0' }}>{incident.timestamp}</p>
                          {incident.attachments && incident.attachments.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ color: '#374151', fontSize: '13px', marginBottom: '6px' }}>Attachments</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                {incident.attachments.map((att) => (
                                  <div key={att.url} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px' }}>
                                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '6px', wordBreak: 'break-all' }}>{att.name}</div>
                                    {att.isVideo ? (
                                      <div style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '12px', padding: '20px', textAlign: 'center', borderRadius: '4px' }}>Video</div>
                                    ) : (
                                      <img src={att.url} alt={att.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#444', marginBottom: '20px' }}>Welcome to CECD! Connect your wallet to get started.</p>
            <button 
              onClick={handleConnect}
              disabled={loading}
              style={{ 
                background: '#3b82f6', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
