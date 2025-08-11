// Reusable Survey Question Component
// Handles radio, checkbox, slider, and ranking question types

import React, { useState, useEffect, useRef } from 'react';

const SurveyQuestion = ({ 
  question, 
  value, 
  onChange, 
  onBlur,
  onNext,
  error,
  disabled = false,
  autoFocus = false 
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [rankingOrder, setRankingOrder] = useState(value || []);
  const [isAnimating, setIsAnimating] = useState(false);
  const questionRef = useRef(null);
  const firstOptionRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
    if (question.response_type === 'ranking') {
      setRankingOrder(value || []);
    }
  }, [value, question.response_type]);

  // Auto-focus on question when it becomes active
  useEffect(() => {
    if (autoFocus && questionRef.current) {
      setIsAnimating(true);
      setTimeout(() => {
        questionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        if (firstOptionRef.current) {
          firstOptionRef.current.focus();
        }
        setIsAnimating(false);
      }, 100);
    }
  }, [autoFocus]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
        if (localValue && onNext) {
          e.preventDefault();
          onNext();
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (question.response_type === 'radio') {
          e.preventDefault();
          handleArrowNavigation(e.key === 'ArrowDown');
        }
        break;
    }
  };

  const handleArrowNavigation = (isDown) => {
    const currentIndex = question.options.indexOf(localValue);
    let newIndex;
    
    if (isDown) {
      newIndex = currentIndex < question.options.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : question.options.length - 1;
    }
    
    handleChange(question.options[newIndex]);
  };

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
    
    // Auto-advance for radio questions after selection
    if (question.response_type === 'radio' && onNext) {
      setTimeout(() => {
        onNext();
      }, 800); // Small delay to show selection feedback
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(localValue);
    }
  };

  const handleCheckboxChange = (option, checked) => {
    const currentValues = Array.isArray(localValue) ? localValue : [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(v => v !== option);
    }
    
    handleChange(newValues);
  };

  const handleRankingChange = (draggedItem, targetIndex) => {
    const newOrder = [...rankingOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    
    if (draggedIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
    } else {
      newOrder.splice(targetIndex, 0, draggedItem);
    }
    
    setRankingOrder(newOrder);
    handleChange(newOrder);
  };

  const renderRadioQuestion = () => (
    <div 
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      onKeyDown={handleKeyDown}
    >
      {question.options.map((option, index) => {
        const isSelected = localValue === option;
        return (
          <label 
            key={index}
            ref={index === 0 ? firstOptionRef : null}
            tabIndex={disabled ? -1 : 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 24px',
              borderRadius: '12px',
              border: isSelected ? '3px solid #FF6E4C' : '2px solid #e5e7eb',
              backgroundColor: isSelected ? '#fff7ed' : 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: disabled ? 0.5 : 1,
              boxShadow: isSelected 
                ? '0 6px 20px rgba(255, 110, 76, 0.25), 0 0 0 3px rgba(255, 110, 76, 0.1)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isSelected) {
                e.target.style.borderColor = '#FF8A6B';
                e.target.style.backgroundColor = '#fef7f0';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isSelected) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.borderColor = '#FF6E4C';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 110, 76, 0.2)';
              }
            }}
            onBlur={(e) => {
              if (!disabled && !isSelected) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }
            }}
            onClick={() => !disabled && handleChange(option)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                !disabled && handleChange(option);
              }
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid ' + (isSelected ? '#FF6E4C' : '#d1d5db'),
              backgroundColor: isSelected ? '#FF6E4C' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              transition: 'all 0.3s ease'
            }}>
              {isSelected && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }} />
              )}
            </div>
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={isSelected}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            <span style={{
              fontSize: '16px',
              color: isSelected ? '#18365E' : '#374151',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontWeight: isSelected ? '600' : '500',
              lineHeight: '1.5'
            }}>
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderCheckboxQuestion = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {question.options.map((option, index) => {
        const isChecked = Array.isArray(localValue) && localValue.includes(option);
        return (
          <label 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 24px',
              borderRadius: '12px',
              border: isChecked ? '2px solid #FF6E4C' : '2px solid #e5e7eb',
              backgroundColor: isChecked ? '#fff7ed' : 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: disabled ? 0.5 : 1,
              boxShadow: isChecked ? '0 4px 12px rgba(255, 110, 76, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isChecked) {
                e.target.style.borderColor = '#FF8A6B';
                e.target.style.backgroundColor = '#fef7f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isChecked) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: '2px solid ' + (isChecked ? '#FF6E4C' : '#d1d5db'),
              backgroundColor: isChecked ? '#FF6E4C' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              transition: 'all 0.3s ease'
            }}>
              {isChecked && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
              onBlur={handleBlur}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            <span style={{
              fontSize: '16px',
              color: isChecked ? '#18365E' : '#374151',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontWeight: isChecked ? '600' : '500',
              lineHeight: '1.5'
            }}>
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );

  const renderSliderQuestion = () => {
    const currentValue = localValue || question.min;
    const percentage = ((currentValue - question.min) / (question.max - question.min)) * 100;
    
    return (
      <div style={{ padding: '24px 0' }}>
        {/* Current Value Display */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FF6E4C',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '24px',
            fontSize: '24px',
            fontWeight: '700',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            boxShadow: '0 4px 12px rgba(255, 110, 76, 0.3)'
          }}>
            {currentValue}
          </div>
        </div>
        
        {/* Custom Slider */}
        <div style={{
          position: 'relative',
          padding: '0 24px',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#FF6E4C',
              borderRadius: '4px',
              width: `${percentage}%`,
              transition: 'width 0.3s ease',
              background: 'linear-gradient(90deg, #FF6E4C 0%, #FF8A6B 100%)'
            }} />
          </div>
          
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step || 1}
            value={currentValue}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            onBlur={handleBlur}
            disabled={disabled}
            style={{
              position: 'absolute',
              top: '-8px',
              left: '24px',
              right: '24px',
              width: 'calc(100% - 48px)',
              height: '24px',
              background: 'transparent',
              outline: 'none',
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          />
        </div>
        
        {/* Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          fontSize: '14px',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          <div style={{
            textAlign: 'left',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>MIN</div>
            <div style={{ color: '#18365E', fontWeight: '600' }}>
              {question.labels?.[question.min] || question.min}
            </div>
          </div>
          
          <div style={{
            textAlign: 'right',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>MAX</div>
            <div style={{ color: '#18365E', fontWeight: '600' }}>
              {question.labels?.[question.max] || question.max}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRankingQuestion = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop to rank in order of priority (1 = highest priority):
      </p>
      
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const currentRank = rankingOrder.indexOf(option) + 1;
          const isRanked = rankingOrder.includes(option);
          
          return (
            <div
              key={option}
              draggable={!disabled}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', option)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedItem = e.dataTransfer.getData('text/plain');
                handleRankingChange(draggedItem, index);
              }}
              className={`
                flex items-center justify-between p-3 rounded-lg border cursor-move transition-all
                ${isRanked 
                  ? 'border-[#FF6E4C] bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-sm text-gray-700">{option}</span>
              {isRanked && (
                <span className="bg-[#FF6E4C] text-white text-xs px-2 py-1 rounded-full font-medium">
                  #{currentRank}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div 
      ref={questionRef}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: autoFocus 
          ? '0 8px 32px rgba(255, 110, 76, 0.15), 0 0 0 2px rgba(255, 110, 76, 0.1)' 
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
        border: autoFocus ? '2px solid #FF6E4C' : '2px solid #f1f5f9',
        transition: 'all 0.5s ease',
        transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
        opacity: isAnimating ? 0.9 : 1
      }}>
      {/* Question Header */}
      <div style={{
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '2px solid #18365E'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          lineHeight: '1.4'
        }}>
          {question.question_text}
          {question.required && (
            <span style={{
              color: '#FF6E4C',
              marginLeft: '8px',
              fontSize: '18px'
            }}>*</span>
          )}
        </h3>
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '12px'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '14px',
              margin: 0,
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </p>
          </div>
        )}
      </div>

      {/* Question Input */}
      <div>
        {question.response_type === 'radio' && renderRadioQuestion()}
        {question.response_type === 'checkbox' && renderCheckboxQuestion()}
        {question.response_type === 'slider' && renderSliderQuestion()}
        {question.response_type === 'ranking' && renderRankingQuestion()}
      </div>
    </div>
  );
};

export default SurveyQuestion;
