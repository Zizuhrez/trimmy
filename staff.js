const pinInput = document.getElementById("pinInput");
const findButton = document.getElementById("findButton");
const resultDiv = document.getElementById("result");

findButton.addEventListener("click", async () => {
  const enteredPin = pinInput.value.trim();
  if (!enteredPin) return alert("Please enter a PIN");

  const snapshot = await db.collection("appointments").where("pin", "==", parseInt(enteredPin)).get();

  if (snapshot.empty) {
    resultDiv.innerHTML = "<p style='color:red;'>No appointment found with this PIN.</p>";
    return;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  resultDiv.innerHTML = `
    <p><strong>Customer:</strong> ${data.nickname}</p>
    <p><strong>Type:</strong> ${data.type}</p>
    <p><strong>Status:</strong> ${data.status}</p>
    <button id="markServing">Mark as Serving</button>
    <button id="markDone">Mark as Done</button>
  `;

  document.getElementById("markServing").addEventListener("click", async () => {
    await db.collection("appointments").doc(doc.id).update({ status: "serving" });
    alert("Status updated to 'serving'");
    pinInput.value = "";
    resultDiv.innerHTML = "";
  });

  document.getElementById("markDone").addEventListener("click", async () => {
    await db.collection("appointments").doc(doc.id).update({ status: "served" });
    alert("Appointment marked as done");
    pinInput.value = "";
    resultDiv.innerHTML = "";
  });
});
