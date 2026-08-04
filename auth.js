// Firebase SDKs Import (Web/CDN Version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TERI NAYI FIREBASE CONFIG (wolf-e32e5 project)
const firebaseConfig = {
  apiKey: "AIzaSyBIGOsCnSjDOq6tyyZwJfk...", // Yahan pura API key daalna
  authDomain: "wolf-e32e5.firebaseapp.com",
  projectId: "wolf-e32e5",
  storageBucket: "wolf-e32e5.firebasestorage.app",
  messagingSenderId: "718132070256",
  appId: "1:718132070256:web:ed38cdb69...", // Yahan pura App ID daalna
  measurementId: "G-5KS4SVKH93"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Form Submit Event Listener
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Page reload rokne ke liye

    // Form ki values nikalna
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Selected Gender aur Avatar nikalna
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;

    if(username === "" || password === "") {
        alert("Bhai Username aur Password daalna zaroori hai! ❌");
        return;
    }

    try {
        // Button text change karke loading feel dena
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerText = "WAIT KAR BHAI... ⏳";
        loginBtn.disabled = true;

        // Firestore database mein 'users' collection ke andar username check karna
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // USER PEHLE SE HAI (LOGIN)
            const userData = userSnap.data();
            
            if (userData.password === password) {
                // Login Success - Data local storage mein save kar lo
                localStorage.setItem("vipUser", JSON.stringify(userData));
                alert("Welcome Back " + username + "! 😎");
                window.location.href = "home.html"; // Redirect to Dashboard
            } else {
                alert("Galat Password! Hacker banne ki koshish mat kar. ❌");
                loginBtn.innerText = "LOGIN / SIGN UP";
                loginBtn.disabled = false;
            }
        } else {
            // NAYA USER HAI (SIGN UP)
            const newUserData = {
                username: username,
                password: password, // Asli app mein password hash karte hain, par abhi basic chalega
                gender: gender,
                avatar: avatar,
                diamonds: 0,     // Naye user ko 0 diamond
                coins: 0,        // Naye user ko 0 coins
                vipLevel: 0,     // VIP level 0 se start hoga
                tickets: 0,      // Anonymous chat tickets
                joinedAt: new Date().toISOString()
            };

            // Database mein save karna
            await setDoc(userRef, newUserData);
            
            // Local storage mein save karna (taaki next pages par user ki details dikhe)
            localStorage.setItem("vipUser", JSON.stringify(newUserData));
            
            alert("Naya Account Ban Gaya! Welcome to VIP Chat 🔥");
            window.location.href = "home.html"; // Redirect to Dashboard
        }
    } catch (error) {
        console.error("Database Error: ", error);
        alert("Kuch error aagaya bhai, internet check kar.");
        
        // Button reset
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.innerText = "LOGIN / SIGN UP";
        loginBtn.disabled = false;
    }
});

