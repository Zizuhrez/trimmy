const form = document.getElementById("bookingForm");
const appointmentType = document.getElementById("appointmentType");
const paymentAmount = document.getElementById("paymentAmount");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const type = appointmentType.value;
  const price = type === "VIP" ? 20 : 10;
  const nickname = firstName.toLowerCase();

  const pin = Math.floor(1000 + Math.random() * 9000); // 🔐 Generate 4-digit PIN

  await db.collection("appointments").add({
    nickname,
    type,
    phone,
    price,
    pin, // ✅ Save PIN with appointment
    status: "waiting",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert(`Appointment booked! You’ll pay $${price}\nYour PIN: ${pin}\nKeep it safe — staff will need it.`);
  form.reset();
  paymentAmount.textContent = "Payment: $0";
});

db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === "served") return;
      if (data.type === "VIP") vipList.push(data);
      else regularList.push(data);
    });

    const fullList = [...vipList, ...regularList];
    queueList.innerHTML = "";
    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${person.nickname} - ${person.type} - ${person.status}`;
      queueList.appendChild(li);
    });
  });