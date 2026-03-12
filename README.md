# Real-Time Collaborative Document Editor

A full-stack, real-time synchronization application built with **React** and **Socket.io**. This project enables multiple users to collaborate on documents in private rooms with seamless state syncing and activity logging.

## 🚀 Key Features

* **Room-Based Isolation**: Users can join specific Document IDs. Communication is scoped to rooms, ensuring privacy between different document sessions.
* **Live Synchronization**: Leveraging WebSockets for sub-100ms latency updates across all connected clients.
* **Smart Cursor Management**: Uses React `useRef` and `setSelectionRange` to prevent cursor "jumping" when receiving remote updates.
* **Activity Feed**: A dedicated event log that tracks connection status and notifies users when others join the document.
* **Infinite Loop Protection**: Implements server-side broadcasting (`socket.to().emit`) to ensure clients don't re-process their own outgoing changes.

## 🛠️ Tech Stack

- **Frontend**: React (Functional Components, Hooks)
- **Backend**: Node.js & Socket.io
- **Communication**: WebSockets (WS)
- **Tooling**: Vite (recommended)

## 📦 Getting Started

### 1. Server Setup
```bash
# Navigate to your server folder
cd server
npm install socket.io http
# Run the server
node server.js
```
The server listens on port 5000.
```bash

# Navigate to your client folder
cd client
npm install socket.io-client react
# Start the development server
npm run dev

```

The client usually runs on http://localhost:5173.

🖥️ System Architecture
Handshake: Client connects to the Node.js server via io().

Join Room: User submits a documentId, triggering socket.join(documentId) on the server.

Data Flow:

User types in textarea.

Client emits document-update with { documentId, newContent }.

Server broadcasts to the specific room excluding the sender.

Other clients update their local state and restore cursor position.

📝 Configuration (CORS)
The server is configured to allow requests from http://localhost:5173. If your frontend runs on a different port, update the origin in server.js:

JavaScript
```bash
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:YOUR_PORT",
        methods: ["GET", "POST"],
    },
});
```

## 📂 Project Structure

### Backend
- **server.js**: Manages socket connections, room assignments, and data broadcasting. Includes an in-memory `documentStore` to persist data while the server is running.

### Frontend
- **App.js**: The "Source of Truth." It manages the global connection state, the list of activity events, and the currently active `documentId`.
- **DocumentEditor.js**: A specialized component that handles the `textarea`. It uses `useRef` to ensure the user's cursor doesn't jump when external updates are received.
- **MyForm.js**: A controlled form that allows users to target a specific document room.
- **socket.js**: A singleton instance of the socket connection to ensure the app doesn't create multiple redundant connections.

## 🛠️ Future Roadmap

To move this from a prototype to a production-ready application, the following features are planned:

### 1. Persistent Storage (Database)
Currently, document data is stored in a volatile in-memory object on the server.
- **Goal**: Integrate **MongoDB** or **Redis** to save document state so content is not lost when the server restarts.

### 2. Conflict Resolution (CRDTs)
The current system uses "Last-Write-Wins" logic. If two users type at the exact same millisecond, data loss can occur.
- **Goal**: Implement **Yjs** or **Automerge** (Conflict-free Replicated Data Types) to allow seamless, high-frequency merging of simultaneous edits.

### 3. User Presence & Authentication
- **User Profiles**: Integration with **Auth0** or **JWT** to identify who is editing.
- **Presence Indicators**: Show "User X is typing..." and a list of active participants in the current room.

### 4. Rich Text Support
- **Goal**: Transition from a basic `textarea` to a rich text editor like **Quill.js** or **Slate.js** to support bold, italics, and image embedding.

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Developed with ❤️ by Zelalem Getnet**




