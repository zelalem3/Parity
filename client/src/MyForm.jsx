// MyForm.js
import React, { useState } from 'react';
import { socket } from './socket';

export function MyForm({ setDocumentId }) {
  const [documentIdInput, setDocumentIdInput] = useState('');

  const handleChange = (event) => {
    setDocumentIdInput(event.target.value);
  };

// Inside MyForm.js handleJoin
const handleJoin = (event) => {
  event.preventDefault();
  if (!documentIdInput) return;

  setDocumentId(documentIdInput);
  socket.emit('join-document', documentIdInput);
  
  // OPTIONAL: Manually add a log for the local user
  // (You would need to pass fooEvents setter to MyForm as a prop to do this)
};

  return (
    <form onSubmit={handleJoin}>
      <input 
        type="text"
        placeholder="Enter document ID to join"
        // FIXED: Changed from documentId to documentIdInput
        value={documentIdInput} 
        onChange={handleChange}
      />
      <button type="submit">Join Document</button>
    </form>
  );
}