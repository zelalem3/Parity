import React, { useState, useEffect, useRef } from 'react';
import { socket } from './socket';

export function DocumentEditor() {
  const [content, setContent] = useState('');
  const editorRef = useRef(null);
  const documentId = 'default-doc'; // In a real app, this could be dynamic

  // Join the document room and set up listeners
  useEffect(() => {
    socket.emit('join-document', documentId);

    function onDocumentUpdate(newContent) {
      setContent(newContent);
    }
    socket.on('document-update', onDocumentUpdate);
    return () => {
      socket.off('document-update', onDocumentUpdate);
    };
  }, [documentId]);

  // Send local changes to server
  function handleChange(e) {
    const newValue = e.target.value;
    setContent(newValue);
    socket.emit('document-update', newValue);
  }

  return (
    <div>
      <h2>Collaborative Document Editor</h2>
      <textarea
        ref={editorRef}
        value={content}
        onChange={handleChange}
        rows={15}
        cols={80}
        style={{ fontFamily: 'monospace', fontSize: '1rem', width: '100%' }}
      />
    </div>
  );
}
