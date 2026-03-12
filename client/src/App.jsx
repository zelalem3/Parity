import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { ConnectionState } from './ConnectionState';
import { ConnectionManager } from './ConnectionManager';
import { Events } from "./Event";
import { DocumentEditor } from './DocumentEditor';
import { MyForm } from './MyForm';
import AuthComponent from './AuthComponent';
import { onAuthStateChanged } from 'firebase/auth';
// Import 'auth' specifically, not just the 'app' config
import { auth } from './firebase'; 

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);
  const [documentId, setDocumentId] = useState('');
  
  // FIX: Track the actual user object so you can use their name/email later
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  // AUTH OBSERVER: This keeps you logged in on refresh
  useEffect(() => {
    // Pass 'auth' here, which is initialized in your firebase.js
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); 
    });

    return () => unsubscribe(); 
  }, []);

  // SOCKET EVENTS
  useEffect(() => {
    const addEvent = (message) => {
      setFooEvents((prev) => [...prev, message]);
    };

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', addEvent);

    socket.on('user-joined', (userId) => {
      addEvent(`User ${userId} joined the room`);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', addEvent);
      socket.off('user-joined');
    };
  }, []);

  // 1. Show loading screen while Firebase checks for a saved session
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <p>Checking session...</p>
      </div>
    );
  }

  // 2. If no user is found after loading, show AuthComponent
  if (!user) {
    return <AuthComponent onLoginSuccess={(u) => setUser(u)} />;
  }

  // 3. Main App Layout
  return (
    <div className="App">
      {/* Nice to show who is logged in */}
      <div style={{ textAlign: 'right', padding: '10px' }}>
        <span>Logged in as: <b>{user.displayName || user.email}</b></span>
      </div>

      <ConnectionState isConnected={isConnected} />
      <h1>Collaborative Editor</h1>
      <ConnectionManager />

      {documentId ? (
        <DocumentEditor documentId={documentId} />
      ) : (
        <MyForm setDocumentId={setDocumentId} />
      )}

      <Events events={[...fooEvents].reverse()} />
    </div>
  );
}