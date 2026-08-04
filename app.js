// ==========================================
// 1. INITIALIZATION & USER DATA LOAD
// ==========================================
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const userJSON = localStorage.getItem("vipUser");
    if (!userJSON) {
        alert("Pehle Login kar bhai! 🛑");
        window.location.href = "index.html";
        return;
    }

    currentUser = JSON.parse(userJSON);

    document.getElementById("displayUsername").innerText = currentUser.username;
    document.getElementById("profileUsername").innerText = currentUser.username;
    document.getElementById("diamondCount").innerText = currentUser.diamonds || 0;
    document.getElementById("coinCount").innerText = currentUser.coins || 0;
    document.getElementById("vipBadge").innerText = "VIP " + (currentUser.vipLevel || 0);
    
    if(document.getElementById("ticketCount")) {
        document.getElementById("ticketCount").innerText = currentUser.tickets || 0;
    }
    
    document.getElementById("appIdSpan").innerText = "#" + Math.floor(Math.random() * 900000 + 100000); 

    // Avatar Image Mapper (Supports 5 Avatars now)
    const avatarSrc = currentUser.avatar ? currentUser.avatar : "avatar1.png";
    let imgUrl = "";
    if (avatarSrc === "avatar1.png") imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";
    else if (avatarSrc === "avatar2.png") imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka";
    else if (avatarSrc === "avatar3.png") imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack";
    else if (avatarSrc === "avatar4.png") imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=VIPBoss";
    else if (avatarSrc === "avatar5.png") imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=CyberQueen";
    else imgUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";

    document.getElementById("userAvatar").src = imgUrl;
    document.getElementById("profileAvatar").src = imgUrl;

    if(typeof AgoraRTC !== 'undefined') {
        initAgora();
    }
});

// ==========================================
// 2. TAB SWITCHING LOGIC
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
// 3. LOGOUT
// ==========================================
function logout() {
    localStorage.removeItem("vipUser");
    window.location.href = "index.html";
}

// ==========================================
// 4. VIP STORE & MATCHMAKING LOGIC (Tickets & Gender)
// ==========================================
function showTopup() {
    document.getElementById("topupModal").style.display = "flex";
}

function closeTopup() {
    document.getElementById("topupModal").style.display = "none";
}

function processPayment(amount) {
    const upiId = "7014582566@fam";
    const name = "VIP Chat Topup"; 
    const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    window.location.href = upiLink;
    alert("Payment app open ho rahi hai... Payment ke baad admin diamonds bhej dega!");
    closeTopup(); 
}

// Matchmaking Gender Selection & Ticket Logic
let selectedMatchGender = "Any";
const genderBtns = document.querySelectorAll('.gender-btn');
genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        genderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMatchGender = btn.innerText.trim();
        
        // Ticket Cost Update Logic
        const ticketInfo = document.querySelector('.ticket-info');
        if (selectedMatchGender === "Any") {
            ticketInfo.innerHTML = `Cost: <span style="color: #00ffa2; font-weight:bold;">FREE (0 Tickets)</span>`;
        } else {
            ticketInfo.innerHTML = `Cost: 1 Ticket 🎟️ (Available: <span id="ticketCount">${currentUser.tickets || 0}</span>)`;
        }
    });
});

document.getElementById("findMatchBtn").addEventListener("click", () => {
    if (selectedMatchGender === "Any") {
        alert("🔍 Searching for an anonymous match (FREE)...");
    } else {
        if ((currentUser.tickets || 0) < 1) {
            alert("❌ Aapke paas tickets khatam ho gaye hain! Top-up store se tickets le lo.");
            return;
        }
        alert(`🔍 Searching for a ${selectedMatchGender} match using 1 Ticket...`);
    }
});

// ==========================================
// 5. AGORA LIVE VOICE ROOM & VIP ANNOUNCEMENT
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
        if (mediaType === "audio") {
            user.audioTrack.play(); 
        }
    });
}

async function createVoiceRoom() {
    const randomUid = Math.floor(1000 + Math.random() * 9000).toString();
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

        await rtc.client.join(AGORA_APP_ID, channelName, null, null);
        rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await rtc.client.publish([rtc.localAudioTrack]);
        
        document.getElementById("callStatus").innerText = "Live (Mic ON) 🟢";
        document.getElementById("callStatus").style.color = "#00ffa2";
        
        // ⭐ VIP ENTRY ANNOUNCEMENT FEATURE ⭐
        if (currentUser && currentUser.vipLevel > 0) {
            alert(`📢 ANNOUNCEMENT: Kripa okat me rahe apke room me ek amir VIP (${currentUser.username}) aya hai! 😎😎`);
        } else {
            alert(`Room Create ho gaya! Room UID: [ ${channelName} ]`);
        }
        
    } catch (error) {
        console.error("Agora Error: ", error);
        alert("Mic permission nahi mili. Error: " + error.message);
        leaveVoiceRoom(); 
    }
}

async function leaveVoiceRoom() {
    if (rtc.localAudioTrack) rtc.localAudioTrack.close(); 
    if (rtc.client) await rtc.client.leave(); 
    
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
// 6. CHAT SEARCH LOGIC
// ==========================================
function searchUserForChat() {
    const searchId = document.getElementById("searchUserId").value.trim();
    if(searchId === "") {
        alert("Bhai search karne ke liye username likh toh sahi!");
        return;
    }
    alert(`Searching for user: ${searchId}...`);
}
