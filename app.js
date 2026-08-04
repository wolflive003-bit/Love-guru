// ==========================================
// INITIALIZATION & USER DATA LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // LocalStorage se user ka data nikalna
    const userJSON = localStorage.getItem("vipUser");
    
    // Agar data nahi hai, matlab user bina login kiye direct aa gaya hai
    if (!userJSON) {
        alert("Pehle Login kar bhai! 🛑");
        window.location.href = "index.html"; // Wapas login page par bhej do
        return;
    }

    // JSON text ko wapas JavaScript object me badalna
    const user = JSON.parse(userJSON);

    // Profile aur Dashboard me user ka data set karna
    document.getElementById("displayUsername").innerText = user.username;
    document.getElementById("profileUsername").innerText = user.username;
    document.getElementById("diamondCount").innerText = user.diamonds;
    document.getElementById("coinCount").innerText = user.coins;
    document.getElementById("vipBadge").innerText = "VIP " + user.vipLevel;
    
    // Check if tickets exist, otherwise set to 0
    document.getElementById("ticketCount").innerText = user.tickets || 0;
    
    // Ek random App ID generate karna dikhane ke liye
    document.getElementById("appIdSpan").innerText = "#" + Math.floor(Math.random() * 900000 + 100000); 

    // Avatar ki photo set karna (jo usne login ke time select ki thi)
    const avatarSrc = user.avatar ? user.avatar : "avatar1.png";
    let imgUrl = "";
    if (avatarSrc === "avatar1.png") {
        imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";
    } else if (avatarSrc === "avatar2.png") {
        imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka";
    } else {
        imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack";
    }

    document.getElementById("userAvatar").src = imgUrl;
    document.getElementById("profileAvatar").src = imgUrl;
});

// ==========================================
// TAB SWITCHING LOGIC (Bottom Nav)
// ==========================================
function switchTab(tabId) {
    // 1. Saare sections ko hide kar do
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.remove('active-section'));

    // 2. Saare buttons se 'active' class hata do
    const buttons = document.querySelectorAll('.nav-item');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Jo tab click hua hai, usko show karo
    document.getElementById(tabId).classList.add('active-section');
    
    // 4. Click hue button par 'active' class (Green color) laga do
    event.currentTarget.classList.add('active');
}

// ==========================================
// LOGOUT FUNCTION
// ==========================================
function logout() {
    // LocalStorage se data delete karo aur index par wapas jao
    localStorage.removeItem("vipUser");
    window.location.href = "index.html";
}

// ==========================================
// TOP-UP FUNCTION (UPI Integration)
// ==========================================
function showTopup() {
    // Abhi ke liye ek simple prompt
    let amount = prompt("Kitne rupay ka Top-up karna hai? \n(Offer: ₹10 = 500 💎, ₹50 = 3000 💎)");

    if (amount && amount > 0) {
        // TERI UPI ID YAHAN SET HAI
        const upiId = "7014582566@fam";
        const name = "VIP Chat Topup"; 
        
        // UPI Deep Link generate karna (Ye direct PhonePe/GPay/Paytm kholega)
        const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

        // User ke phone mein UPI app open karne ka command
        window.location.href = upiLink;

        // Payment par click karne ke baad alert
        alert("Payment app open ho rahi hai... Payment successful hone ke baad admin aapke Diamonds credit kar dega! 😎");
        
    } else {
        alert("Top-up cancel kar diya gaya.");
    }
}

// ==========================================
// MATCH GENDER BUTTON LOGIC
// ==========================================
const genderBtns = document.querySelectorAll('.gender-btn');
genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Sabse active class hatao
        genderBtns.forEach(b => b.classList.remove('active'));
        // Jispe click hua uspe lagao
        btn.classList.add('active');
    });
});
