/* global __firebase_config, __initial_auth_token, __looker_studio_embed_url, __app_id */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Mock use case data for demonstration
const mockUseCases = [
  { id: 1, name: 'Intelligent Patient Engagement and Education Ecosystems', type: 'Strategic', category: 'Patient Care', financialValue: 85, implementationEase: 70 },
  { id: 2, name: 'Integrated Chronic Disease Management Ecosystems', type: 'Strategic', category: 'Clinical', financialValue: 90, implementationEase: 65 },
  { id: 3, name: 'Remote Patient Monitoring and Virtual Care Solutions', type: 'Quick Win', category: 'Technology', financialValue: 75, implementationEase: 85 },
  { id: 4, name: 'Predictive Analytics for Utilization Management and Cost Reduction', type: 'Strategic', category: 'Analytics', financialValue: 95, implementationEase: 60 },
  { id: 5, name: 'Interoperable Personal Health Records (PHRs)', type: 'Strategic', category: 'Data', financialValue: 80, implementationEase: 55 },
  { id: 6, name: 'Pharmacovigilance and Drug Safety Monitoring', type: 'Quick Win', category: 'Safety', financialValue: 70, implementationEase: 80 },
  { id: 7, name: 'Population Health Management Infrastructure and Tools', type: 'Strategic', category: 'Population Health', financialValue: 88, implementationEase: 58 },
  { id: 8, name: 'Integrated Virtual Care and Remote Patient Monitoring Ecosystem', type: 'Strategic', category: 'Virtual Care', financialValue: 82, implementationEase: 72 },
  { id: 9, name: 'AI-Powered Revenue Cycle Optimization and Financial Analytics', type: 'Quick Win', category: 'Financial', financialValue: 78, implementationEase: 85 },
  { id: 10, name: 'Interoperable Health Data Exchange Platform', type: 'Strategic', category: 'Interoperability', financialValue: 85, implementationEase: 50 },
  { id: 11, name: 'Multi-modal Patient Engagement and Care Management Solutions', type: 'Strategic', category: 'Engagement', financialValue: 77, implementationEase: 68 },
  { id: 12, name: 'Real-Time Patient Flow and Capacity Management', type: 'Quick Win', category: 'Operations', financialValue: 72, implementationEase: 82 },
  { id: 13, name: 'Value-Based Contract Modeling and Negotiation Support', type: 'Strategic', category: 'Contracts', financialValue: 90, implementationEase: 55 },
  { id: 14, name: 'Healthcare IoT Integration and Analytics Platform', type: 'Strategic', category: 'IoT', financialValue: 83, implementationEase: 62 },
  { id: 15, name: 'Patient-Centric Care Coordination and Communication Tools', type: 'Quick Win', category: 'Coordination', financialValue: 74, implementationEase: 78 },
  // Additional use cases to demonstrate showing all vs top 15
  { id: 16, name: 'Clinical Decision Support Systems', type: 'Strategic', category: 'Clinical', financialValue: 68, implementationEase: 75 },
  { id: 17, name: 'Automated Appointment Scheduling', type: 'Quick Win', category: 'Operations', financialValue: 65, implementationEase: 90 },
  { id: 18, name: 'Telemedicine Platform Integration', type: 'Quick Win', category: 'Technology', financialValue: 71, implementationEase: 88 },
  { id: 19, name: 'Patient Portal Enhancement', type: 'Quick Win', category: 'Patient Care', financialValue: 63, implementationEase: 85 },
  { id: 20, name: 'Electronic Health Record Optimization', type: 'Strategic', category: 'Data', financialValue: 79, implementationEase: 45 },
  { id: 21, name: 'Medical Imaging AI Analysis', type: 'Strategic', category: 'AI/ML', financialValue: 86, implementationEase: 40 },
  { id: 22, name: 'Supply Chain Management System', type: 'Quick Win', category: 'Operations', financialValue: 67, implementationEase: 80 },
  { id: 23, name: 'Clinical Trial Management Platform', type: 'Strategic', category: 'Research', financialValue: 73, implementationEase: 50 },
  { id: 24, name: 'Patient Satisfaction Survey Automation', type: 'Quick Win', category: 'Quality', financialValue: 58, implementationEase: 92 },
  { id: 25, name: 'Regulatory Compliance Dashboard', type: 'Strategic', category: 'Compliance', financialValue: 76, implementationEase: 65 },
  { id: 26, name: 'Staff Scheduling Optimization', type: 'Quick Win', category: 'HR', financialValue: 62, implementationEase: 87 },
  { id: 27, name: 'Emergency Response Coordination System', type: 'Strategic', category: 'Emergency', financialValue: 81, implementationEase: 48 },
  { id: 28, name: 'Patient Education Content Management', type: 'Quick Win', category: 'Education', financialValue: 59, implementationEase: 83 },
  { id: 29, name: 'Clinical Workflow Automation', type: 'Strategic', category: 'Workflow', financialValue: 84, implementationEase: 52 },
  { id: 30, name: 'Mobile Health App Integration', type: 'Quick Win', category: 'Mobile', financialValue: 66, implementationEase: 79 }
];

function MatrixPage(props) {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState(null); // For click-to-filter functionality
  const [useCases, setUseCases] = useState([]); // Start with empty array for Firebase data
  const [loading, setLoading] = useState(true); // Set to true while loading from Firebase
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const firebaseConfigString = props.__firebase_config;
      let firebaseConfig = {};
      if (typeof firebaseConfigString === 'string' && firebaseConfigString.trim()) {
        firebaseConfig = JSON.parse(firebaseConfigString);
      }
      if (!Object.keys(firebaseConfig).length) return;

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          try {
            const initialAuthToken = props.__initial_auth_token ?? null;
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              setUserId(firebaseAuth.currentUser.uid);
            } else {
              await signInAnonymously(firebaseAuth);
              setUserId(crypto.randomUUID());
            }
          } catch (error) {
            console.error("Auth error:", error);
            setUserId(crypto.randomUUID());
          } finally {
            setIsAuthReady(true);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase init error:", error);
    }
  }, [props.__firebase_config, props.__initial_auth_token]);

  // Firebase data fetching useEffect
  useEffect(() => {
    if (!db || !isAuthReady) return;
    
    console.log('🔥 Fetching use cases from Firestore...');
    const q = query(collection(db, 'prioritizedUseCases'), orderBy('total_score', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📊 Received', snapshot.docs.length, 'use cases from Firestore');
      const useCasesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Debug: Log the first use case to see available fields
      if (useCasesData.length > 0) {
        console.log('🔍 First use case data:', useCasesData[0]);
        console.log('🔍 Available fields:', Object.keys(useCasesData[0]));
      }
      
      setUseCases(useCasesData);
      setLoading(false);
    }, (err) => {
      console.error('❌ Firestore fetch error:', err);
      setError('Failed to load use cases from Firestore.');
      setLoading(false);
      // Fallback to mock data if Firebase fails
      setUseCases(mockUseCases);
    });
    return () => unsubscribe();
  }, [db, isAuthReady]);

  const filteredUseCases = useCases.filter(uc =>
    (selectedType === 'all' || uc.type === selectedType) &&
    (selectedCategory === 'all' || (uc.category === selectedCategory || uc.category_name === selectedCategory)) // Support both field names
  );

  const uniqueTypes = ['all', ...new Set(useCases.map(uc => uc.type).filter(Boolean))];
  const uniqueCategories = ['all', ...new Set(useCases.map(uc => uc.category_name).filter(Boolean))];

  const LOOKER_STUDIO_BASE_URL = props.__looker_studio_embed_url || '';
  const generateFilteredEmbedUrl = () => {
    const params = [];
    if (selectedType !== 'all') params.push(`params.type_filter=${encodeURIComponent(selectedType)}`);
    if (selectedCategory !== 'all') params.push(`params.category_filter=${encodeURIComponent(selectedCategory)}`);
    return LOOKER_STUDIO_BASE_URL + (params.length ? '?' + params.join('&') : '');
  };

  const UseCaseList = () => {
    if (loading) return <div className="bg-gray-100 p-4 text-center text-gray-800">Loading Use Cases...</div>;
    if (error) return <div className="bg-red-100 p-4 text-center text-red-800">{error}</div>;
    if (useCases.length === 0) return <div className="bg-gray-100 p-4 text-center text-gray-800">No use cases found.</div>;

    const fullSortedList = filteredUseCases
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    
    const displayList = selectedUseCase 
      ? [selectedUseCase] // Show only selected use case
      : fullSortedList.slice(0, 15); // Show top 15 as usual
    
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Use Case Prioritization
          </h2>
          {selectedUseCase && (
            <button
              onClick={() => setSelectedUseCase(null)}
              style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#6b7280',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              Show All
            </button>
          )}
        </div>
        
        {selectedUseCase && (
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px',
            fontStyle: 'italic'
          }}>
            Showing selected use case with original ranking
          </div>
        )}
        
        <ol style={{
          listStyleType: 'decimal',
          listStylePosition: 'outside',
          fontSize: '14px',
          color: '#6b7280',
          paddingLeft: '20px',
          margin: 0,
          lineHeight: '1.2'
        }}>
          {displayList.map((useCase, displayIndex) => {
            const originalRanking = fullSortedList.findIndex(item => item.id === useCase.id) + 1;
            
            return (
              <li 
                key={useCase.id} 
                value={selectedUseCase ? originalRanking : displayIndex + 1}
                style={{
                  marginBottom: '6px',
                  paddingLeft: '4px',
                  display: 'list-item',
                  verticalAlign: 'top',
                  backgroundColor: selectedUseCase && selectedUseCase.id === useCase.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderRadius: '4px',
                  padding: selectedUseCase && selectedUseCase.id === useCase.id ? '4px' : '0',
                  border: selectedUseCase && selectedUseCase.id === useCase.id ? '1px solid rgba(59, 130, 246, 0.2)' : 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  width: '100%'
                }}>
                  <button
                    onClick={() => setSelectedUseCase(useCase)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      fontSize: '14px',
                      textDecoration: 'underline',
                      flex: 1,
                      marginRight: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                  >
                    {useCase.name}
                  </button>
                  <button
                    onClick={() => navigate(`/usecase/${useCase.id}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '2px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#374151'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    title="View use case details"
                  >
                    →
                  </button>
                </div>
                {selectedUseCase && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    Original Ranking: #{originalRanking}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      backgroundColor: '#f8fafc',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px' // Reduced from 24px to 16px
    }}>
      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        padding: '12px 0', // Reduced from 16px to 12px for consistent spacing
        borderBottom: '1px solid #d1d5db',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label 
            htmlFor="typeFilter" 
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937'
            }}
          >
            Use Case Type:
          </label>
          <select
            id="typeFilter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              display: 'block',
              width: '160px',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            {uniqueTypes.map(type => <option key={type} value={type}>{type === 'all' ? 'All' : type}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label 
            htmlFor="categoryFilter" 
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937'
            }}
          >
            Use Case Category:
          </label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              display: 'block',
              width: '160px',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            {uniqueCategories.map(category => <option key={category} value={category}>{category === 'all' ? 'All' : category}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        flex: 1
      }}>
        {/* Matrix Chart - Reduced size */}
        <div style={{
          width: '60%', // Reduced from flex: 1 to fixed 60%
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          height: '450px', // Reduced from minHeight: 600px to fixed 450px
          position: 'relative'
        }}>
          {/* Matrix Chart Content */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            {/* Quadrant Labels */}
            {/* Top-Left: Strategic Investments */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Strategic Investments
            </div>
            {/* Top-Right: Quick Wins */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Quick Wins
            </div>
            {/* Bottom-Left: Resource Drains */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Resource Drains
            </div>
            {/* Bottom-Right: Efficiency Boosters */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Efficiency Boosters
            </div>
            {/* Y-axis label and values */}
            <div style={{
              position: 'absolute',
              left: '-40px',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6',
              whiteSpace: 'nowrap'
            }}>
              Financial Value
            </div>
            {/* Y-axis value labels */}
            <div style={{
              position: 'absolute',
              left: '-20px',
              top: '10px',
              fontSize: '10px',
              color: '#6b7280'
            }}>
              High
            </div>

            <div style={{
              position: 'absolute',
              left: '-15px',
              bottom: '10px',
              fontSize: '10px',
              color: '#6b7280'
            }}>
              Low
            </div>
            
            {/* X-axis label and values */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6',
              whiteSpace: 'nowrap'
            }}>
              Ease-of-Implementation
            </div>
            {/* X-axis value labels */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '10px',
              fontSize: '10px',
              color: '#6b7280'
            }}>
              Low
            </div>

            <div style={{
              position: 'absolute',
              bottom: '-20px',
              right: '10px',
              fontSize: '10px',
              color: '#6b7280'
            }}>
              High
            </div>
            
            {/* Grid Lines and Axes */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Subtle quadrant background colors */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f9fafb" strokeWidth="1"/>
                </pattern>
              </defs>
              
              {/* Quadrant backgrounds with subtle colors */}
              {/* Top-left: Strategic Investments - Light Blue */}
              <rect x="0" y="0" width="50%" height="50%" fill="rgba(59, 130, 246, 0.03)" />
              {/* Top-right: Quick Wins - Light Green */}
              <rect x="50%" y="0" width="50%" height="50%" fill="rgba(16, 185, 129, 0.03)" />
              {/* Bottom-left: Resource Drains - Light Red */}
              <rect x="0" y="50%" width="50%" height="50%" fill="rgba(239, 68, 68, 0.03)" />
              {/* Bottom-right: Efficiency Boosters - Light Orange */}
              <rect x="50%" y="50%" width="50%" height="50%" fill="rgba(245, 158, 11, 0.03)" />
              
              {/* Grid overlay */}
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Main axes - Shortened to stop before text labels */}
              <line x1="50%" y1="8%" x2="50%" y2="92%" stroke="#6b7280" strokeWidth="2" opacity="0.8" /> {/* Vertical line shortened */}
              <line x1="8%" y1="50%" x2="92%" y2="50%" stroke="#6b7280" strokeWidth="2" opacity="0.8" /> {/* Horizontal line shortened */}
              
              {/* Data points positioned by financial value (y-axis) and implementation ease (x-axis) */}
              {/* Show filtered use cases, with selected use case highlighted */}
              {filteredUseCases.map((useCase, index) => {
                // Check if this use case is selected
                const isSelected = selectedUseCase && selectedUseCase.id === useCase.id;
                const isOtherWhenSelected = selectedUseCase && selectedUseCase.id !== useCase.id;
                // Use actual Firestore field names: value_score and implementation_score
                const financialValue = useCase.value_score || 0;
                const implementationEase = useCase.implementation_score || 0;
                
                // Convert financial value to y position (inverted - higher value = higher on chart)
                const y = 100 - (financialValue / 100 * 80 + 10); // Scale and invert Y axis
                // Convert implementation ease to x position  
                const x = implementationEase / 100 * 80 + 10; // Scale X axis
                
                // Determine quadrant and assign colors
                const isHighValue = financialValue > 50;
                const isHighEase = implementationEase > 50;
                
                let pointColor, strokeColor, quadrantName;
                if (isHighValue && isHighEase) {
                  // Quick Wins (top-right) - Green
                  pointColor = '#10b981';
                  strokeColor = '#059669';
                  quadrantName = 'Quick Wins';
                } else if (isHighValue && !isHighEase) {
                  // Strategic Investments (top-left) - Blue
                  pointColor = '#3b82f6';
                  strokeColor = '#2563eb';
                  quadrantName = 'Strategic Investments';
                } else if (!isHighValue && isHighEase) {
                  // Efficiency Boosters (bottom-right) - Orange
                  pointColor = '#f59e0b';
                  strokeColor = '#d97706';
                  quadrantName = 'Efficiency Boosters';
                } else {
                  // Resource Drains (bottom-left) - Red
                  pointColor = '#ef4444';
                  strokeColor = '#dc2626';
                  quadrantName = 'Resource Drains';
                }
                
                return (
                  <circle
                    key={useCase.id}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={isSelected ? "7" : "5"}
                    fill={pointColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? "3" : "2"}
                    style={{ 
                      cursor: 'pointer', 
                      opacity: isOtherWhenSelected ? 0.2 : (isSelected ? 1 : 0.8),
                      filter: isSelected ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : 'none'
                    }}
                    onClick={() => setSelectedUseCase(useCase)}
                    onMouseEnter={(e) => {
                      if (!isOtherWhenSelected) {
                        e.target.style.opacity = '1';
                        e.target.setAttribute('r', isSelected ? '8' : '6');
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = isOtherWhenSelected ? '0.2' : (isSelected ? '1' : '0.8');
                      e.target.setAttribute('r', isSelected ? '7' : '5');
                    }}
                  >
                    <title>{useCase.name}\nQuadrant: {quadrantName}\nValue Score: {financialValue.toFixed(1)}\nImplementation Score: {implementationEase.toFixed(1)}\nTotal Score: {useCase.total_score || 'N/A'}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Use Case Prioritization List - Expanded width */}
        <div style={{ width: '40%', flexShrink: 0 }}> {/* Expanded from 300px to 40% */}
          <UseCaseList />
        </div>
      </div>
    </div>
  );
}

export default MatrixPage;
