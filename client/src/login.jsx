import { getAuth } from "firebase/auth";

const fetchPrivateData = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    // Force refresh the token to ensure it's valid
    const idToken = await user.getIdToken(true);

    const response = await fetch('https://your-api.com/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Send the token in the Authorization header
        'Authorization': `Bearer ${idToken}`
      }
    });

    const data = await response.json();
    console.log(data);
  }
};