// Firebase SDKs Import (Web/CDN Version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TERI FIREBASE CONFIG (wolf-e32e5 project)
const firebaseConfig = {
  apiKey: "AIzaSyBIGOsCnSjDOq6tyyZwJfk...", 
  authDomain: "wolf-e32e5.firebaseapp.com",
  projectId: "wolf-e32e5",
  storageBucket: "wolf-e32e5.firebasestorage.app",
  messagingSenderId: "718132070256",
  appId: "1:718132070256:web:ed38cdb69...", 
  measurementId: "G-5KS4SVKH93"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variable to store selected avatar
let selectedAvatarFile = "avatar1";

// 1. Avatar Selection Logic
window.selectAvatar = function(avatarName, element) {
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    if(element) {
        element.classList.add('selected');
    }
    selectedAvatarFile = avatarName;
};

// 2. Login & Sign Up Logic with Firebase
window.loginUser = async function() {
    const usernameInput = document.getElementById("usernameInput");
    const username = usernameInput ? usernameInput.value.trim() : "";
    
    if (username === "") {
        alert("Bhai apna username toh likh! ❌");
        return;
    }

    try {
        // Firestore mein check karo ki user pehle se hai ya nahi
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        let userData;

        if (userSnap.exists()) {
            // USER PEHLE SE HAI (LOGIN)
            userData = userSnap.data();
            alert("Welcome Back " + username + "! 😎");
        } else {
            // NAYA USER HAI (SIGN UP) - Isme free diamonds/tickets bhi mil jayenge
            userData = {
                username: username,
                avatar: selectedAvatarFile,
                diamonds: 100,
                coins: 500,
                tickets: 3,
                vipLevel: 1,
                joinedAt: new Date().toISOString()
            };

            // Database mein save karna
            await setDoc(userRef, userData);
            alert("Naya Account Ban Gaya! Welcome to VIP Chat 🔥");
        }

        // Local Storage mein save karke dashboard par bhej do
        localStorage.setItem("vipUser", JSON.stringify(userData));
        window.location.href = "home.html";

    } catch (error) {
        console.error("Database Error: ", error);
        alert("Kuch error aagaya bhai, internet connection check kar.");
    }
};

// 3. Top-up & Telegram Bot Notification Logic
window.processPayment = function(amount) {
    const upiId = "7014582566@fam";
    const name = "VIP Chat Topup"; 
    
    let username = "Unknown User";
    const userJSON = localStorage.getItem("vipUser");
    if (userJSON) {
        const user = JSON.parse(userJSON);
        username = user.username;
    }

    const botToken = "8698387580:AAFsa-InQWh_xzP8X4Jopf-cDg4-3BUdY4Q"; 
    const chatId = "8523021225"; 
    
    const message = `🚨 NEW TOPUP REQUEST! 💎\n\n👤 User: ${username}\n💰 Amount: ₹${amount}\n📱 UPI: ${upiId}\n\nStatus: Waiting for screenshot!`;
    
    if (botToken !== "7500000000:AAExampleBotTokenHereToTest") {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
        }).catch(err => console.log("Bot msg error:", err));
    }

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    window.location.href = upiLink;
    
    alert(`Payment app open ho rahi hai (₹${amount}). Payment ke baad screenshot admin ko bhejo! 🚀`);
    
    if (typeof closeTopup === 'function') {
        closeTopup();
    }
};
