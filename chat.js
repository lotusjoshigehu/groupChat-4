/* =========================
   GET LOGGED USER
========================= */

let name = localStorage.getItem("username");
let phone = localStorage.getItem("userphone");

if (!name) name = "User";
if (!phone) phone = "0000000000";

/* =========================
   DOM ELEMENTS
========================= */

const chatList = document.querySelector(".chat-list");
const messagesContainer = document.querySelector(".messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatName = document.getElementById("chatName");
const userphoneEl = document.getElementById("userphone");

let currentChat = null;

/* =========================
   LOCAL CONTACT STORAGE
========================= */

let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

/* Clean corrupted entries */
contacts = contacts.filter(
    c => c && c.phone && c.name && c.phone !== phone
);

localStorage.setItem("contacts", JSON.stringify(contacts));

/* =========================
   MERGE DB USERS INTO CONTACTS
========================= */

async function mergeDBContacts() {

    const res = await fetch(
        `http://localhost:5000/getChatUsers?phone=${phone}`
    );

    const dbUsers = await res.json();

    dbUsers.forEach(user => {

        if (!contacts.find(c => c.phone === user.phone)) {
            contacts.push({
                name: user.phone, // fallback if no saved name
                phone: user.phone
            });
        }
    });

    localStorage.setItem("contacts", JSON.stringify(contacts));
}

/* =========================
   RENDER CONTACTS
========================= */

async function renderContacts() {

    await mergeDBContacts();

    chatList.innerHTML = "";

    const displayContacts = [
        { name: name + " (You)", phone: phone },
        ...contacts
    ];

    displayContacts.forEach(contact => {

        const div = document.createElement("div");
        div.classList.add("chat-item");

        div.innerHTML = `
            <div class="chat-info">
                <h4>${contact.name}</h4>
                <p>Open chat</p>
            </div>
        `;

        div.addEventListener("click", async () => {

            currentChat = contact.phone;

            chatName.textContent = contact.name;
            userphoneEl.textContent = contact.phone;

            await loadMessages();
        });

        chatList.appendChild(div);
    });
}

/* =========================
   ADD CONTACT MANUALLY
========================= */

document.getElementById("addBtn").addEventListener("click", async () => {

    const input = document.getElementById("newContact");
    const contactNumber = input.value.trim();

    if (!contactNumber) return;

    if (contactNumber === phone) {
        alert("You cannot add yourself");
        return;
    }

    const res = await fetch("http://localhost:5000/checkuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactNumber })
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "user not found") return;

    if (contacts.find(c => c.phone === contactNumber)) {
        alert("Contact already added");
        return;
    }

    contacts.push({
        name: data.name,
        phone: contactNumber
    });

    localStorage.setItem("contacts", JSON.stringify(contacts));

    await renderContacts();
});

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    if (!currentChat) {
        alert("Select a contact first");
        return;
    }

    const text = messageInput.value.trim();
    if (!text) return;

    await fetch("http://localhost:5000/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: phone,
            receiver: currentChat,
            text: text
        })
    });

    messageInput.value = "";

    await loadMessages();
    await renderContacts();
}

/* =========================
   LOAD MESSAGES FROM DB
========================= */

async function loadMessages() {

    if (!currentChat) return;

    const res = await fetch(
        `http://localhost:5000/getMessages?user1=${phone}&user2=${currentChat}`
    );

    const messages = await res.json();

    messagesContainer.innerHTML = "";

    messages.forEach(msg => {

        const div = document.createElement("div");

        if (msg.sender === phone) {
            div.classList.add("msg", "sent");
        } else {
            div.classList.add("msg", "received");
        }

        div.innerHTML = `
            ${msg.text}
            <span>${new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            })}</span>
        `;

        messagesContainer.appendChild(div);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* =========================
   AUTO REFRESH
========================= */

setInterval(() => {
    if (currentChat) loadMessages();
    renderContacts();
}, 5000);

/* =========================
   EVENTS
========================= */

messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

/* =========================
   INITIAL LOAD
========================= */

renderContacts();
