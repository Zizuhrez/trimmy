const form = document.getElementById("bookingForm");
const appointmentType = document.getElementById("appointmentType");
const paymentAmount = document.getElementById("paymentAmount");
const queueList = document.getElementById("queueList");

// Update payment text
appointmentType.addEventListener("change", () => {
  const type = appointmentType.value;
  paymentAmount.textContent = type === "VIP" ? "Payment: $20" :
                              type === "Regular" ? "Payment: $10" : "Payment: $0";
});

// Booking form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const type = appointmentType.value;
  const price = type === "VIP" ? 20 : 10;
  const nickname = firstName.toLowerCase();

  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  await db.collection("appointments").add({
    nickname,
    phone,
    type,
    price,
    pin,
    status: "waiting",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  window.location.href = `confirmation.html?pin=${pin}`;
});

// Real-time queue display
db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const servingList = [];
    const waitingVipList = [];
    const waitingRegularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === "served") return;

      if (data.status === "serving") {
        servingList.push(data);
      } else if (data.type === "VIP") {
        waitingVipList.push(data);
      } else {
        waitingRegularList.push(data);
      }
    });

    const fullList = [...servingList, ...waitingVipList, ...waitingRegularList];
    queueList.innerHTML = "";

    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.classList.add("queue-item");

      let content = `<strong>${index + 1}. ${person.nickname}</strong> - ${person.type} - ${person.status}`;

      if (person.status === "serving") {
        content += ` <span class="serving-badge">⭐Currently Serving....</span>`;
        li.style.backgroundColor = "#fff5d1";
        li.style.borderLeft = "5px solid #facc15";
      } else if (person.status === "waiting") {
        li.style.backgroundColor = "#e0f2fe";
        li.style.borderLeft = "5px solid #3b82f6";
      }

      li.innerHTML = content;
      queueList.appendChild(li);
    });
  });

// Staff panel access
document.getElementById("goToStaff").addEventListener("click", () => {
  const staffPin = prompt("Enter staff PIN:");
  const correctPin = "2025";

  if (staffPin === correctPin) {
    window.location.href = "staff.html";
  } else {
    alert("Incorrect PIN. Access denied.");
  }
});