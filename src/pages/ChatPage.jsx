import React, { useState, useRef, useEffect } from 'react';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👋 Hi Chris! How can I help you unlock value from your data today?' },
    { sender: 'user', text: 'How can we monetize our predictive analytics platform?' },
    { sender: 'ai', text: '📊 Great question! One option is to offer it as an Analytics-as-a-Service model to affiliated providers. You can bundle predictive dashboards with insights-as-a-subscription and charge based on usage or panel size.' },
    { sender: 'user', text: 'What kind of ROI can we expect from that approach?' },
    { sender: 'ai', text: '📈 We\'ve seen typical ROI between 3x–6x within 12 months. Success depends on readiness, data quality, and provider uptake. Would you like help modeling potential revenue or building a pilot plan?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Reset scroll position when component mounts - multiple approaches for reliability
  useEffect(() => {
    // Immediate scroll reset
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also reset after a short delay to handle any layout shifts
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Only scroll to bottom for new messages, not on initial load
  useEffect(() => {
    // Don't auto-scroll on initial page load to prevent jumping
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: '✅ I\'ll generate a sample model and recommend which use cases to prioritize based on your data profile.'
      }]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      paddingTop: '0px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: 'white',
        borderRight: '1px solid #d1d5db',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginLeft: '24px',
        marginRight: '16px'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#f97316',
            paddingTop: '12px',
            margin: '0'
          }}>Data Strategy Assistant</h2>
        </div>
        
        <div style={{
          flex: '1',
          overflowY: 'auto',
          paddingRight: '16px',
          paddingLeft: '8px',
          paddingTop: '16px'
        }}>
          {/* Top Asked Questions */}
          <div style={{marginTop: '12px'}}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#f97316',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '0px'
            }}>
              <span style={{marginRight: '8px'}}>📌</span> Top Asked Questions
            </h3>
            <ol style={{
              fontSize: '14px',
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('What are our highest-value use cases?'); }}>1. What are our highest-value use cases?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('How can we benchmark financial value?'); }}>2. How can we benchmark financial value?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('What datasets are required for monetization?'); }}>3. What datasets are required for monetization?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('How do we identify quick wins?'); }}>4. How do we identify quick wins?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('How do we ensure HIPAA compliance?'); }}>5. How do we ensure HIPAA compliance?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('Can we sell historical data legally?'); }}>6. Can we sell historical data legally?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('Which departments benefit most from monetization?'); }}>7. Which departments benefit most from monetization?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('How do we calculate readiness score?'); }}>8. How do we calculate readiness score?</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#f97316', textDecoration: 'none', cursor: 'pointer'}} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'} onClick={(e) => { e.preventDefault(); handleSuggestionClick('Can we license de-identified data?'); }}>9. Can we license de-identified data?</a></li>
            </ol>
          </div>

          {/* Prior Conversations */}
          <div style={{marginTop: '20px'}}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#f97316',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '0px'
            }}>
              <span style={{marginRight: '8px'}}>💬</span> Prior Conversations
            </h3>
            <ul style={{
              fontSize: '14px',
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• ROI on Data Subscriptions (Jul 18)</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Benchmarking Cost Savings</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• SDOH Integration Strategy</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Top Monetizable Assets</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Analytics-as-a-Service Inquiry</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Risk Adjustment Data Planning</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• CFO Strategy Questions</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Health Data Marketplace Model</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• Readiness Survey Walkthrough</a></li>
              <li style={{marginBottom: '4px'}}><a href="#" style={{color: '#6b7280', textDecoration: 'none', cursor: 'pointer', fontWeight: '500'}} onMouseOver={(e) => {e.target.style.color = '#f97316'; e.target.style.textDecoration = 'underline';}} onMouseOut={(e) => {e.target.style.color = '#6b7280'; e.target.style.textDecoration = 'none';}}>• ED Optimization Opportunity</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginLeft: '16px'
      }}>
        {/* Chat Messages Area */}
        <div style={{
          flex: '1',
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: 'white',
          paddingRight: '32px',
          maxHeight: 'calc(100vh - 200px)'
        }}>
          <div style={{
            maxWidth: '1024px',
            margin: '0 auto'
          }}>
            {/* Breadcrumb Navigation */}
            <div style={{
              marginBottom: '24px'
            }}>
              <nav style={{
                fontSize: '20px',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontWeight: '700',
                color: '#6b7280'
              }}>
                <a href="/" style={{
                  color: '#FF6E4C',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Home
                </a>
                <span style={{ margin: '0 8px', color: '#FF6E4C', fontWeight: '700' }}>›</span>
                <span style={{ color: '#374151', fontWeight: '700' }}>AI Advisor Assistant</span>
              </nav>
            </div>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  position: 'relative',
                  maxWidth: '512px',
                  padding: '20px 24px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: msg.sender === 'user' ? '#f97316' : 'white',
                  color: msg.sender === 'user' ? 'white' : '#374151',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : '#f97316'
                  }}>
                    <span style={{fontSize: '16px'}}>{msg.sender === 'user' ? '👤' : '🤖'}</span>
                    <span style={{textTransform: 'uppercase', letterSpacing: '0.05em'}}>{msg.sender === 'user' ? 'You' : 'AI Assistant'}</span>
                  </div>
                  <div style={{lineHeight: '1.6', fontWeight: '500'}}>{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Bar at Bottom */}
        <div style={{
          flexShrink: '0',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1536px',
            margin: '0 auto'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              style={{
                flex: '1',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                backgroundColor: input.trim() ? '#f97316' : '#d1d5db',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '16px',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                minWidth: '80px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (input.trim()) e.target.style.backgroundColor = '#ea580c';
              }}
              onMouseOut={(e) => {
                if (input.trim()) e.target.style.backgroundColor = '#f97316';
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;