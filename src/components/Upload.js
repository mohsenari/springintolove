import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function Upload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithProgress = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 11),
      progress: 0,
      status: 'pending', // pending, uploading, complete, error
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...filesWithProgress]);
    filesWithProgress.forEach(fileObj => uploadFile(fileObj));
  };

  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('image', fileObj.file);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === fileObj.id ? { ...f, status: 'uploading' } : f
      ));

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, progress: percentComplete } : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, status: 'complete', progress: 100 } : f
          ));
        } else {
          setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, status: 'error' } : f
          ));
        }
      });

      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id ? { ...f, status: 'error' } : f
        ));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f =>
        f.id === fileObj.id ? { ...f, status: 'error' } : f
      ));
    }
  };

  return (
    <section className="section upload-page">
      <Link to="/" className="home-link">
        <svg className="home-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </Link>
      <div className="upload-container">
        <h1 className="upload-title">Share Your Memories</h1>
        <p className="upload-description">Upload your favorite photos from our special day</p>

        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-content">
            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="dropzone-text">Drag & drop images here</p>
            <p className="dropzone-subtext">or click to browse</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {files.length > 0 && (
          <div className="files-list">
            {files.map(fileObj => (
              <div key={fileObj.id} className="file-item">
                <div className="file-preview">
                  <img src={fileObj.preview} alt={fileObj.file.name} />
                </div>
                <div className="file-info">
                  <div className="file-header">
                    <span className="file-name">{fileObj.file.name}</span>
                  </div>
                  <div className="file-size">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  {fileObj.status !== 'pending' && (
                    <div className="progress-container">
                      <div
                        className={`progress-bar ${fileObj.status}`}
                        style={{ width: `${fileObj.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="file-status">
                    {fileObj.status === 'uploading' && `Uploading... ${Math.round(fileObj.progress)}%`}
                    {fileObj.status === 'complete' && '✓ Upload complete'}
                    {fileObj.status === 'error' && '✗ Upload failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Upload;
