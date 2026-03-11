const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Allowed origins
        methods: ["GET", "POST"], // Allowed HTTP methods
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join-document", (documentId) => {
        socket.join(documentId);
        socket.documentId = documentId; // Track which document this socket is editing
        console.log(`User ${socket.id} joined document: ${documentId}`);
        // Notify others in the room that a new user has joined
        socket.to(documentId).emit("user-joined", socket.id);
    });

    // Listen for document updates and broadcast to others in the same room
    socket.on("document-update", (newContent) => {
        const documentId = socket.documentId;
        if (documentId) {
            // Broadcast to all other clients in the same document room
            socket.to(documentId).emit("document-update", newContent);
        }
    });
});

httpServer.listen(5000, () => {
    console.log("Server is listening on port 5000");
});