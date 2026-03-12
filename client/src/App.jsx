// App.js
import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { ConnectionState } from './ConnectionState';
import { ConnectionManager } from './ConnectionManager';
import { Events } from "./Event";
import { DocumentEditor } from './DocumentEditor';
import { MyForm } from './MyForm';
import AuthComponent from './AuthComponent';
export default function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [loggedin, setLoggedin] = useState(false);

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

  //  Conditional rendering AFTER hooks
  if (!loggedin) {
    return<AuthComponent setLoggedin={setLoggedin} />
  }

  return (
    <div className="App">
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