const { createServer } = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


// Fetch document
const fetchDocument = async (collectionName, documentId) => {
  const docRef = db.collection(collectionName).doc(documentId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    return docSnap.data();
  } else {
    return null;
  }
};


// Create document
const createDocument = async () => {
  const docRef = await db.collection("Parity-collection").add({
    content: "",
  });

  console.log("Document created:", docRef.id);
  return docRef.id;
};


// Update document
const updateDocument = async (collectionName, documentId, updatedData) => {

  const docRef = db.collection(collectionName).doc(documentId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {

    // create the document
    await docRef.set({
      content: ""
    });

    console.log("Document created:", documentId);
  }

  await docRef.update(updatedData);
};


io.on("connection", (socket) => {

  console.log(`User Connected: ${socket.id}`);

  socket.on("join-document", async (documentId) => {

    let documentData = await fetchDocument("Parity-collection", documentId);

    // If document doesn't exist → create
    if (!documentData) {
      const newDocumentId = await createDocument();

      socket.join(newDocumentId);
      socket.emit("document-update", "");

      console.log(`User ${socket.id} created document ${newDocumentId}`);
      return;
    }

    socket.join(documentId);

    const existingContent = documentData.content || "";

    socket.emit("document-update", existingContent);

    console.log(`User ${socket.id} joined ${documentId}`);
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


httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});