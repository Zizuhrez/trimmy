// Get the form and Firestore
const form = document.getElementById("bookingForm");
const db = firebase.firestore();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form input values
  const name = document.getElementById("name").value;
  const type = document.getElementById("appointmentType").value;

  // Generate a 4-digit random PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  // Save to Firestore
  db.collection("appointments").add({
    name,
    type,
    status: "waiting",
    pin,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    // Save PIN (and other info if needed) in localStorage
    localStorage.setItem("appointmentPIN", pin);
    localStorage.setItem("appointmentName", name);
    localStorage.setItem("appointmentType", type);

    // Redirect to confirmation page
    window.location.href = "confirmation.html";
  })
  .catch((error) => {
    console.error("❌ Error booking appointment:", error);
    alert("Something went wrong. Please try again.");
  });
});