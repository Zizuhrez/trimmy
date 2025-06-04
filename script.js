const form = document.getElementById("bookingForm");
const appointmentType = document.getElementById("appointmentType");
const paymentAmount = document.getElementById("paymentAmount");
const queueList = document.getElementById("queueList");

appointmentType.addEventListener("change", () => {
  const type = appointmentType.value;
  paymentAmount.textContent = type === "VIP" ? "Payment: $20" :
                              type === "Regular" ? "Payment: $10" : "Payment: $0";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const type = appointmentType.value;
  const price = type === "VIP" ? 20 : 10;
  const nickname = firstName.toLowerCase();

  // Generate 4-digit random PIN
  const pin = Math.floor(1000 + Math.random() * 9000);

  await db.collection("appointments").add({
    nickname,
    phone,
    type,
    price,
    pin, // Save the secret pin
    status: "waiting",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert(`Appointment booked! You’ll pay $${price}. Your secret PIN is: ${pin}`);
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
