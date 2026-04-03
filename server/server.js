const { createServer } = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

// 1. DEFINE THE PORT (Crucial for Render)
const PORT = process.env.PORT || 10000;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require('./serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 2. NAME CONSISTENCY: Changed to 'server' to match your listen call
const httpServer = createServer(); 

const io = new Server(httpServer, {
  cors: {
    // 3. ADD YOUR VERCEL URL HERE once you have it
    origin: ["http://localhost:5173", "https://parity-ruby.vercel.app/"],
    methods: ["GET", "POST"],
  },
});

// ... [Your fetchDocument, createDocument, and updateDocument functions stay the same] ...

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join-document", async (documentId) => {
    let documentData = await fetchDocument("Parity-collection", documentId);

    if (!documentData) {
      const newDocumentId = await createDocument();
      socket.join(newDocumentId);
      socket.emit("document-update", "");
      return;
    }

    socket.join(documentId);
    const existingContent = documentData.content || "";
    socket.emit("document-update", existingContent);
  });

  socket.on("document-update", async ({ documentId, newContent }) => {
    await updateDocument("Parity-collection", documentId, {
      content: newContent
    });
    socket.to(documentId).emit("document-update", newContent);
  });

  socket.on("leave-document", (documentId) => {
    socket.leave(documentId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// 4. FIX: Use 'httpServer' (the variable you defined at the top)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});