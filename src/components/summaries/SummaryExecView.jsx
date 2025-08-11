// src/components/summaries/SummaryExecView.jsx
import React, { useMemo, useState } from 'react';
import './summaryExecView.css';

// Parse markdown into structured sections
function parseSummaryMarkdown(markdown) {
  if (!markdown) return {};
  
  // Normalize newlines and trim
  const normalized = markdown.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  
  // Split by section headers (##)
  const sections = normalized.split(/\n##\s+/);
  
  const parsed = {
    overview: [],
    strengths: [],
    gaps: [],
    recommendations: []
  };
  
  sections.forEach(section => {
    // Get the first line as the header
    const lines = section.split('\n');
    const header = lines[0].toLowerCase().trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Map headers to keys
    if (header.includes('overview') || header.includes('executive brief')) {
      parsed.overview = extractParagraphs(content);
    } else if (header.includes('strength')) {
      parsed.strengths = extractBullets(content);
    } else if (header.includes('gap') || header.includes('challenge')) {
      parsed.gaps = extractBullets(content);
    } else if (header.includes('recommendation') || header.includes('actionable')) {
      parsed.recommendations = extractBullets(content);
    } else if (content) {
      // Unknown sections append to overview
      parsed.overview.push(...extractParagraphs(content));
    }
  });
  
  // If no sections found, treat entire content as overview
  if (!hasAnyContent(parsed) && normalized) {
    parsed.overview = extractParagraphs(normalized);
  }
  
  return parsed;
}

// Extract paragraphs from text
function extractParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n\n+/)
    .map(p => cleanMarkdown(p.trim()))
    .filter(p => p.length > 0);
}

// Extract bullet points from text
function extractBullets(text) {
  if (!text) return [];
  
  // Look for lines starting with -, *, •, or numbered lists
  const lines = text.split('\n');
  const bullets = [];
  
  lines.forEach(line => {
    const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
    if (cleaned) {
      bullets.push(cleanMarkdown(cleaned));
    }
  });
  
  return bullets;
}

// Clean markdown formatting
function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/`(.*?)`/g, '$1')       // Remove code
    .trim();
}

// Check if parsed content has any data
function hasAnyContent(parsed) {
  return (
    (parsed.overview && parsed.overview.length > 0) ||
    (parsed.strengths && parsed.strengths.length > 0) ||
    (parsed.gaps && parsed.gaps.length > 0) ||
    (parsed.recommendations && parsed.recommendations.length > 0)
  );
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

// Get icon for summary type
function getTypeIcon(type) {
  switch(type) {
    case 'strategy': return '🎯';
    case 'capabilities': return '⚡';
    case 'readiness': return '🚀';
    default: return '📊';
  }
}

// Get title for summary type
function getTypeTitle(type) {
  switch(type) {
    case 'strategy': return 'Strategy';
    case 'capabilities': return 'Capabilities';
    case 'readiness': return 'Readiness';
    default: return 'Summary';
  }
}

// Section Card Component
function SectionCard({ title, children, tone }) {
  const className = `sev-card ${tone ? `sev-${tone}` : ''}`;
  
  return (
    <div className={className}>
      <h3>{title}</h3>
      <div className="sev-body">
        {children}
      </div>
    </div>
  );
}

// Paragraphs Component with Collapsible
function Paragraphs({ text, collapsible = true }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text || text.length === 0) return null;
  
  const fullText = text.join('\n\n');
  const shouldCollapse = collapsible && fullText.length > 500;
  const displayText = shouldCollapse && !expanded 
    ? fullText.substring(0, 500) + '...'
    : fullText;
  
  return (
    <>
      <div className="sev-paragraphs">
        {displayText.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {shouldCollapse && (
        <button 
          className="sev-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

// Numbered List Component
function Numbered({ items }) {
  if (!items || items.length === 0) return null;
  
  return (
    <ol className="sev-list sev-numbered">
      {items.map((item, i) => (
        <li key={i}>
          <strong>{i + 1}.</strong> {item}
        </li>
      ))}
    </ol>
  );
}

// Bullet List Component
function Bullets({ items, icon }) {
  if (!items || items.length === 0) return null;
  
  const iconChar = icon === 'check' ? '✅' : icon === 'alert' ? '⚠️' : '•';
  
  return (
    <ul className="sev-list sev-bullets">
      {items.map((item, i) => (
        <li key={i}>
          <span className="sev-icon">{iconChar}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Main Component
export default function SummaryExecView({ 
  summaryMarkdown, 
  meta, 
  onRefresh, 
  onRegenerate, 
  isRefreshing 
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const parsed = useMemo(() => parseSummaryMarkdown(summaryMarkdown), [summaryMarkdown]);
  
  // Copy to clipboard
  const copyRendered = async () => {
    try {
      const container = document.querySelector('.sev-container');
      if (container) {
        const text = container.innerText;
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Print/Download PDF
  const printSummary = () => {
    window.print();
  };
  
  // Empty state
  if (!summaryMarkdown) {
    return (
      <div className="sev-empty">
        <div className="sev-empty-icon">📄</div>
        <h3>No Summary Available</h3>
        <p>Generate an AI-powered summary of your survey responses.</p>
        {onRegenerate && (
          <button 
            className="sev-generate-btn"
            onClick={onRegenerate}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Generating...' : 'Generate Summary'}
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="sev-container">
      {/* Meta pills */}
      <div className="sev-header">
        <div className="sev-meta">
          {meta?.version && (
            <span className="sev-pill">v{meta.version}</span>
          )}
          {meta?.model && (
            <span className="sev-pill">{meta.model}</span>
          )}
          {meta?.generatedAt && (
            <span className="sev-pill">{formatDate(meta.generatedAt)}</span>
          )}
          {meta?.clientId && (
            <span className="sev-pill">Client {meta.clientId}</span>
          )}
          {meta?.summaryType && (
            <span className={`sev-pill sev-type-${meta.summaryType}`}>
              {getTypeIcon(meta.summaryType)} {getTypeTitle(meta.summaryType)}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="sev-actions">
          <button 
            onClick={copyRendered} 
            aria-label="Copy summary"
            className="sev-action-btn"
          >
            {copySuccess ? '✓ Copied' : '📋 Copy'}
          </button>
          <button 
            onClick={printSummary} 
            aria-label="Download PDF"
            className="sev-action-btn"
          >
            📥 Download
          </button>
          <button 
            onClick={onRefresh} 
            disabled={isRefreshing} 
            aria-label="Refresh"
            className="sev-action-btn"
          >
            {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          {onRegenerate && (
            <button 
              onClick={onRegenerate} 
              disabled={isRefreshing}
              aria-label="Regenerate"
              className="sev-action-btn sev-regenerate"
            >
              ✨ Regenerate
            </button>
          )}
        </div>
      </div>
      
      {/* Content layout */}
      <div className="sev-grid">
        <main className="sev-main">
          {parsed.overview && parsed.overview.length > 0 && (
            <SectionCard title="Overview">
              <Paragraphs text={parsed.overview} collapsible />
            </SectionCard>
          )}
          
          {parsed.recommendations && parsed.recommendations.length > 0 && (
            <SectionCard title="Actionable Recommendations">
              <Numbered items={parsed.recommendations} />
            </SectionCard>
          )}
          
          {!hasAnyContent(parsed) && (
            <SectionCard title="Summary">
              <Paragraphs text={[summaryMarkdown]} collapsible={false} />
            </SectionCard>
          )}
        </main>
        
        <aside className="sev-aside">
          {parsed.strengths && parsed.strengths.length > 0 && (
            <SectionCard title="Strengths" tone="positive">
              <Bullets items={parsed.strengths} icon="check" />
            </SectionCard>
          )}
          
          {parsed.gaps && parsed.gaps.length > 0 && (
            <SectionCard title="Gaps" tone="warning">
              <Bullets items={parsed.gaps} icon="alert" />
            </SectionCard>
          )}
        </aside>
      </div>
      
      {/* Footer */}
      <div className="sev-footer">
        <span className="sev-footer-text">
          Generated by {meta?.model || 'AI'} • {formatDate(meta?.generatedAt) || 'Recently'} • Version {meta?.version || '1'}
        </span>
      </div>
    </div>
  );
}