import React, { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

export function DocumentEditor({ documentId }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);
  const joinedDocumentRef = useRef(null);

  useEffect(() => {
    if (!documentId) return;

    // If the user switches docs, leave the old room first.
    if (joinedDocumentRef.current && joinedDocumentRef.current !== documentId) {
      socket.emit('leave-document', joinedDocumentRef.current);
    }

    joinedDocumentRef.current = documentId;
    socket.emit('join-document', documentId);

    const handleUpdate = (newContent) => {
      // Save cursor position before update
      const selectionStart = textareaRef.current?.selectionStart;
      const selectionEnd = textareaRef.current?.selectionEnd;

      setContent(newContent);

      // Restore cursor position after React finishes rendering
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    };

    socket.on('document-update', handleUpdate);

    return () => socket.off('document-update', handleUpdate);
  }, [documentId]);

  const handleChange = (event) => {
    const newContent = event.target.value;
    setContent(newContent);
    
    // Send both the content AND the documentId
    socket.emit('document-update', { documentId, newContent });
  };

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      placeholder="Start collaborating..."
      style={{ width: '100%', height: '200px' }}
    />
  );
}