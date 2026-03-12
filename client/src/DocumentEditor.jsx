import React, { useEffect, useState, useRef } from 'react';
import { socket } from './socket';

export function DocumentEditor({ documentId }) {
  
  const joinedDocumentRef = useRef(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  
  // Inside DocumentEditor.js
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
}, [content]);



// Add this inside your DocumentEditor component
const applyFormatting = (prefix, suffix) => {
  const el = textareaRef.current;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const fullText = el.value;
  const selectedText = fullText.substring(start, end);

  // Construct the new content
  const newContent = 
    fullText.substring(0, start) + 
    prefix + selectedText + suffix + 
    fullText.substring(end);

  // Update state and notify socket
  setContent(newContent);
  socket.emit('document-update', { documentId, newContent });

  // Refocus the textarea
  el.focus();
  
  // Optional: Reset cursor position after React render
  setTimeout(() => {
    el.setSelectionRange(start + prefix.length, end + prefix.length);
  }, 0);
};
const style = {
  border: 'none',
  outline: 'none',
  width: '100%', // This fills the 'paper'
  resize: 'none',
  fontSize: '18px',
  lineHeight: '1.6',
  overflow: 'hidden',
  background: 'transparent',
  color: 'black',
  backgroundColor: 'white',
  padding: '0',
  margin: '0',
  display: 'block'
};

  useEffect(() => {
    if (!documentId) return;
    

    // If the user switches docs, leave the old room first.
    if (joinedDocumentRef.current && joinedDocumentRef.current !== documentId) {
      socket.emit('leave-document', joinedDocumentRef.current);
    }

    joinedDocumentRef.current = documentId;
    socket.emit('join-document', documentId);

    const handleUpdate = (newContent) => {
      setIsSaving(true);
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
      setIsSaving(false);
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
  <div className="editor-page" style={{ 
    background: '#f0f2f5', 
    padding: '20px 0', // Reduced top/bottom padding
    minHeight: '100vh', 
    width: '100vw'      // Force full viewport width
  }}>
    <div className="toolbar" style={{ 
  background: 'white', 
  padding: '10px 20px', 
  borderBottom: '1px solid #ddd',
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  gap: '10px'
}}>
  <button onClick={() => applyFormatting('**', '**')}><b>B</b></button>
  <button onClick={() => applyFormatting('_', '_')}><i>I</i></button>
  <button onClick={() => applyFormatting('<u>', '</u>')}><u>U</u></button>
</div>
    
    <div className="paper" style={{
      background: 'white',
      width: '100%',      // Now fills the screen
      minHeight: '100vh',
      margin: '0 auto',
      padding: '60px',    // Standard document margins
      boxSizing: 'border-box', // Crucial: includes padding in width calculation
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <textarea 
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        style={style}
        placeholder="Start typing your masterpiece..."
      />
    </div>
  </div>
);
}