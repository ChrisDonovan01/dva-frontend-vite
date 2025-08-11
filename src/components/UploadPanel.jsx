// Upload Panel Component for Client Data Input Configurator
// Document upload with AI ingestion status tracking

import React, { useState, useRef } from 'react';

const UploadPanel = ({ 
  title = "Document Upload", 
  description = "Upload PDFs and documents for AI analysis",
  onFileUpload,
  acceptedTypes = ".pdf,.doc,.docx,.txt",
  maxSizeMB = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    for (let file of files) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
        continue;
      }

      // Simulate upload process
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        ingestionStatus: 'pending'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, progress } : f)
        );
      }

      // Simulate AI ingestion
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadedFiles(prev => 
        prev.map(f => f.id === newFile.id ? { 
          ...f, 
          status: 'complete',
          ingestionStatus: Math.random() > 0.2 ? 'success' : 'failed'
        } : f)
      );

      if (onFileUpload) {
        onFileUpload(newFile);
      }
    }
    
    setUploading(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIngestionStatusColor = (status) => {
    switch(status) {
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getIngestionStatusText = (status) => {
    switch(status) {
      case 'success': return 'AI Analysis Complete';
      case 'failed': return 'Analysis Failed';
      case 'pending': return 'Processing...';
      default: return 'Waiting';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #18365E'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          {title}
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0
        }}>
          {description}
        </p>
      </div>

      {/* Upload Area */}
      <div
        style={{
          border: `2px dashed ${dragActive ? '#FF6E4C' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#fef3f2' : '#f9fafb',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div style={{
          fontSize: '48px',
          color: dragActive ? '#FF6E4C' : '#9ca3af',
          marginBottom: '16px'
        }}>
          📁
        </div>
        
        <p style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          margin: '0 0 8px 0'
        }}>
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 16px 0'
        }}>
          or click to browse files
        </p>
        
        <button
          style={{
            backgroundColor: '#FF6E4C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Select Files'}
        </button>
        
        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: '12px 0 0 0'
        }}>
          Accepted: PDF, DOC, DOCX, TXT • Max size: {maxSizeMB}MB
        </p>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.map(file => (
            <div key={file.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {file.name}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                
                {file.status === 'uploading' && (
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      width: `${file.progress}%`,
                      height: '100%',
                      backgroundColor: '#FF6E4C',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getIngestionStatusColor(file.ingestionStatus)
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: getIngestionStatusColor(file.ingestionStatus),
                    fontWeight: '500'
                  }}>
                    {getIngestionStatusText(file.ingestionStatus)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => removeFile(file.id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default UploadPanel;
