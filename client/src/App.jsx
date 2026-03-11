// App.js
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { ConnectionState } from './ConnectionState';
import { ConnectionManager } from './ConnectionManager';
import { Events } from "./Event";
import { DocumentEditor } from './DocumentEditor';
import { MyForm } from './MyForm';
export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);
  const [documentId, setDocumentId] = useState('');

  useEffect(() => {
    // 1. Define a single, consistent handler
    const addEvent = (message) => {
      setFooEvents((prev) => [...prev, message]);
    };

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // 2. Register listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', addEvent);
    
    // This is the one you were missing earlier
    socket.on('user-joined', (userId) => {
      addEvent(`User ${userId} joined the room`);
    });

    // 3. CLEANUP: Use the EXACT same function names as above
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', addEvent);
      socket.off('user-joined'); // You can also remove all listeners for this event
    };
  }, []); // Empty array is fine as long as addEvent uses functional updates

  return (
    <div className="App">
      <ConnectionState isConnected={isConnected} />
      <h1>Collaborative Editor</h1>
      <ConnectionManager />
      
      {/* 4. UX Improvement: Only show editor if documentId is set */}
      {documentId ? (
        <DocumentEditor documentId={documentId} />
      ) : (
        <MyForm setDocumentId={setDocumentId} />
      )}
     
      <Events events={[...fooEvents].reverse()} />
    </div>
  );
}