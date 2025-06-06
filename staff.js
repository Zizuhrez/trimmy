const queueList = document.getElementById("queueList");
const db = firebase.firestore();

function renderQueue() {
  queueList.innerHTML = "";

  db.collection("appointments")
    .orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
      queueList.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");

        li.textContent = `${data.name} - ${data.type} - Status: ${data.status}`;

        if (data.status === "waiting") {
          const serveButton = document.createElement("button");
          serveButton.textContent = "Serve";

          serveButton.onclick = () => {
            const enteredPIN = prompt("Enter customer's 4-digit PIN:");

            if (enteredPIN === data.pin) {
              db.collection("appointments").doc(doc.id).update({
                status: "serving"
              }).then(() => {
                alert("✅ Customer is now being served.");
              }).catch((error) => {
                console.error("❌ Error updating status:", error);
              });
            } else {
              alert("❌ Incorrect PIN. Cannot serve.");
            }
          };

          li.appendChild(serveButton);
        }

        queueList.appendChild(li);
      });
    });
}

renderQueue();