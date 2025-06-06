const queueList = document.getElementById("queueList");
const db = firebase.firestore();

function renderQueue() {
  db.collection("appointments")
    .orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
      queueList.innerHTML = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = `${data.name} - ${data.type} - Status: ${data.status}`;

        if (data.status === "waiting") {
          const serveBtn = document.createElement("button");
          serveBtn.textContent = "Serve";
          serveBtn.onclick = () => {
            const enteredPIN = prompt("Enter customer PIN:");
            if (enteredPIN === data.pin) {
              db.collection("appointments").doc(doc.id).update({
                status: "serving"
              });
            } else {
              alert("❌ Incorrect PIN. Cannot serve.");
            }
          };
          li.appendChild(serveBtn);
        }

        queueList.appendChild(li);
      });
    });
}

renderQueue();