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

const editorStyle = {
  width: '100%',
  height: '400px',
  fontSize: '18px',
  border: 'none',
  outline: 'none',
  
  // FIXED COLORS
 // use camelCase for background-color
};
// Style the textarea to remove the border and look like a page
const style = {
  border: 'none',
  outline: 'none',
  width: '100%',
  resize: 'none',
  fontSize: '18px',
  lineHeight: '1.6',
  overflow: 'hidden', // Hide scrollbar as it grows
  background: 'transparent',
   color: 'black',          // or '#000000'
  backgroundColor: 'white' 
   // Make it blend with the paper background
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
  <div className="editor-page" style={{ background: '#f0f2f5', padding: '50px' }}>
    <div className="toolbar" style={{ 
      background: 'white', 
      padding: '10px', 
      borderRadius: '8px 8px 0 0', 
      borderBottom: '1px solid #ddd',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <button><b>B</b></button> <button><i>I</i></button> <button><u>U</u></button>
    </div>
    
    <div className="paper" style={{
      background: 'white',
      maxWidth: '800px',
      minHeight: '1000px',
      margin: '0 auto',
      padding: '60px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <textarea 
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        style={style}
        placeholder="Type your content here..."
      />
    </div>
  </div>
);
}