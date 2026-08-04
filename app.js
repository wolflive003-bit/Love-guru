// ==========================================
// 1. INITIALIZATION & USER DATA LOAD
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
    document.getElementById("diamondCount").innerText = user.diamonds || 0;
    document.getElementById("coinCount").innerText = user.coins || 0;
    document.getElementById("vipBadge").innerText = "VIP " + (user.vipLevel || 0);
    
    // Check if tickets exist, otherwise set to 0
    if(document.getElementById("ticketCount")) {
        document.getElementById("ticketCount").innerText = user.tickets || 0;
    }
    
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

    // Agora Init if SDK is loaded
    if(typeof AgoraRTC !== 'undefined') {
        initAgora();
    }
});

// ==========================================
// 2. TAB SWITCHING LOGIC (Bottom Nav)
// ==========================================
function switchTab(tabId) {
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.remove('active-section'));

    const buttons = document.querySelectorAll('.nav-item');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active-section');
    event.currentTarget.classList.add('active');
}

// ==========================================
// 3. LOGOUT FUNCTION
// ==========================================
function logout() {
    localStorage.removeItem("vipUser");
    window.location.href = "index.html";
}

// ==========================================
// 4. VIP STORE LOGIC (Custom Modal & UPI)
// ==========================================
function showTopup() {
    document.getElementById("topupModal").style.display = "flex";
}

function closeTopup() {
    document.getElementById("topupModal").style.display = "none";
}

function processPayment(amount) {
    // TERI UPI ID
    const upiId = "7014582566@fam";
    const name = "VIP Chat Topup"; 
    
    const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    window.location.href = upiLink;

    alert("Payment app open ho rahi hai... Payment ke baad admin diamonds bhej dega!");
    closeTopup(); 
}

// Match Gender Button Logic
const genderBtns = document.querySelectorAll('.gender-btn');
genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        genderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ==========================================
// 5. AGORA LIVE VOICE ROOM LOGIC
// ==========================================
const AGORA_APP_ID = "765ebaf510f343e4ba27dae4cd6609be";
let rtc = {
    localAudioTrack: null,
    client: null
};
let currentRoomId = null;

async function initAgora() {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    
    rtc.client.on("user-published", async (user, mediaType) => {
        await rtc.client.subscribe(user, mediaType);
        console.log("Subscribed to user:", user.uid);
        
        if (mediaType === "audio") {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play(); 
        }
    });

    rtc.client.on("user-unpublished", (user) => {
        console.log("User muted or left:", user.uid);
    });
}

async function createVoiceRoom() {
    const randomUid = Math.floor(1000 + Math.random() * 9000).toString(); // Example: 4829
    startVoiceCall(randomUid);
}

async function joinVoiceRoom() {
    const roomUid = document.getElementById("joinRoomUid").value.trim();
    if (roomUid === "") {
        alert("Bhai pehle Room UID daal!");
        return;
    }
    startVoiceCall(roomUid);
}

async function startVoiceCall(channelName) {
    try {
        currentRoomId = channelName;
        
        document.querySelector(".room-controls").style.display = "none";
        document.getElementById("activeCallUI").style.display = "block";
        document.getElementById("currentRoomDisplay").innerHTML = `Room UID: <span style="color:#00ffa2;">${channelName}</span>`;
        document.getElementById("callStatus").innerText = "Connecting Mic...";
        document.getElementById("callStatus").style.color = "yellow";

        const uid = await rtc.client.join(AGORA_APP_ID, channelName, null, null);
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await rtc.client.publish([rtc.localAudioTrack]);
        
        document.getElementById("callStatus").innerText = "Live (Mic ON) 🟢";
        document.getElementById("callStatus").style.color = "#00ffa2";
        alert(`Room Create ho gaya! Apna Room UID [ ${channelName} ] apne dosto ko bhej kar unko bula le.`);
        
    } catch (error) {
        console.error("Agora Error: ", error);
        alert("Mic permission nahi mili ya network issue hai. Error: " + error.message);
        leaveVoiceRoom(); 
    }
}

async function leaveVoiceRoom() {
    if (rtc.localAudioTrack) {
        rtc.localAudioTrack.close(); 
    }
    if (rtc.client) {
        await rtc.client.leave(); 
    }
    
    document.getElementById("activeCallUI").style.display = "none";
    document.querySelector(".room-controls").style.display = "block";
    currentRoomId = null;
}

async function toggleMic() {
    const micBtn = document.getElementById("micBtn");
    if (rtc.localAudioTrack.muted) {
        await rtc.localAudioTrack.setMuted(false);
        micBtn.innerText = "🎙️ Mic ON";
        micBtn.className = "action-btn mic-on";
    } else {
        await rtc.localAudioTrack.setMuted(true);
        micBtn.innerText = "🔇 Mic OFF";
        micBtn.className = "action-btn mic-off";
    }
}

// ==========================================
// 6. CHAT SEARCH LOGIC (CometChat Next Step)
// ==========================================
function searchUserForChat() {
    const searchId = document.getElementById("searchUserId").value.trim();
    if(searchId === "") {
        alert("Bhai search karne ke liye username likh toh sahi!");
        return;
    }
    alert(`Searching for user: ${searchId}... \n(Chat engine abhi connect karenge!)`);
}
