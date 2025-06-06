const queueList = document.getElementById("queueList");
const db = firebase.firestore();

function renderQueue() {
  queueList.innerHTML = ""; // Clear list before rendering

  db.collection("appointments")
    .orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
      queueList.innerHTML = ""; // Reset each time data updates

      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");

        li.textContent = `${data.name} - ${data.type} - Status: ${data.status}`;

        if (data.status === "waiting") {
          const serveButton = document.createElement("button");
          serveButton.textContent = "Serve";
          serveButton.onclick = () => {
            const enteredPIN = prompt("Enter customer's PIN:");
            if (enteredPIN === data.pin) {
              db.collection("appointments").doc(doc.id).update({
                status: "serving"
              });
              alert("Customer is now being served.");
            } else {
              alert("Incorrect PIN!");
            }
          };
          li.appendChild(serveButton);
        }

        queueList.appendChild(li);
      });
    });
}

renderQueue();