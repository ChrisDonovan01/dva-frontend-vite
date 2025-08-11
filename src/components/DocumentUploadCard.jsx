import React, { useState, useRef } from 'react';

const DocumentUploadCard = ({ 
  title = "Document Upload",
  description = "Upload strategic plans, technical documentation, or other relevant documents to enhance your analysis.",
  status = 'not-started',
  progress = 0,
  lastUpdated,
  onAction,
  onFileUpload,
  acceptedTypes = ".pdf,.doc,.docx,.txt",
  maxSizeMB = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(status === 'complete');
  const fileInputRef = useRef(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'complete': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'not-started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'complete': return 'Complete';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return 'Not Started';
    }
  };

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
        uploadedAt: new Date().toISOString()
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, progress } : f)
        );
      }

      // Mark as complete
      setUploadedFiles(prev => 
        prev.map(f => f.id === newFile.id ? { 
          ...f, 
          status: 'complete'
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

  const toggleComplete = () => {
    setIsComplete(!isComplete);
    // You could call a callback here to update parent state
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '2px solid #FF6E4C'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#FF6E4C',
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {title}
          </h3>
          
          <div style={{
            backgroundColor: getStatusColor(isComplete ? 'complete' : status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {getStatusText(isComplete ? 'complete' : status)}
          </div>
        </div>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0,
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          {description}
        </p>
      </div>

      {/* Upload Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            border: `2px dashed ${dragActive ? '#FF6E4C' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#fef3f2' : '#f9fafb',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            marginBottom: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '120px'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div style={{
            fontSize: '32px',
            color: dragActive ? '#FF6E4C' : '#9ca3af',
            marginBottom: '12px'
          }}>
            📁
          </div>
          
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 4px 0',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            or click to browse
          </p>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {uploadedFiles.map((file) => (
              <div key={file.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {file.name}
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mark as Complete Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={toggleComplete}
            style={{
              backgroundColor: isComplete ? '#10b981' : '#e5e7eb',
              color: isComplete ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}
          >
            {isComplete ? '✓ Complete' : 'Mark Complete'}
          </button>
        </div>

        {lastUpdated && (
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '8px',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Hidden file input */}
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

export default DocumentUploadCard;
