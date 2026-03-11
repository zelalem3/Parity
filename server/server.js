const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// A simple in-memory store to keep track of document state
// In a real app, you'd use a Database (MongoDB/PostgreSQL)
const documentStore = {};

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join-document", (documentId) => {
        socket.join(documentId);
        
        // 1. Send the EXISTING content to the user who just joined
        const existingContent = documentStore[documentId] || "";
        socket.emit("document-update", existingContent);

        console.log(`User ${socket.id} joined document: ${documentId}`);
    });

    socket.on("leave-document", (documentId) => {
        socket.leave(documentId);
        console.log(`User ${socket.id} left document: ${documentId}`);
    });

    // We destructure the object sent from the client
    socket.on("document-update", ({ documentId, newContent }) => {
        // 2. Update our "database"
        documentStore[documentId] = newContent;

        // 3. Broadcast to everyone ELSE in that room
        socket.to(documentId).emit("document-update", newContent);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});

httpServer.listen(5000, () => {
    console.log("Server is listening on port 5000");
});