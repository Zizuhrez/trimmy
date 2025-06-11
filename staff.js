firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

const staffQueue = document.getElementById("staffQueue");

function updateStatus(docId, newStatus) {
  db.collection("appointments").doc(docId).update({ status: newStatus });
}

db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const servingList = [];
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;

      if (data.status === "serving") {
        servingList.push(data);
      } else if (data.status === "waiting" && data.type === "VIP") {
        vipList.push(data);
      } else if (data.status === "waiting" && data.type === "Regular") {
        regularList.push(data);
      }
    });

    const fullList = [...servingList, ...vipList, ...regularList];
    staffQueue.innerHTML = "";

    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.classList.add("queue-item");

      li.innerHTML = `<strong>${index + 1}. ${person.nickname}</strong> - ${person.type} - ${person.status}`;

      // Add Serving button with PIN check
      if (person.status === "waiting") {
        const serveBtn = document.createElement("button");
        serveBtn.textContent = "Serving";

        serveBtn.onclick = () => {
          const enteredPin = prompt("Enter customer PIN:");
          if (enteredPin === person.pin.toString()) {
            updateStatus(person.id, "serving");
          } else {
            alert("Incorrect PIN. Cannot proceed.");
          }
        };

        li.appendChild(serveBtn);
        li.style.backgroundColor = "#e0f2fe";
        li.style.borderLeft = "5px solid #3b82f6";
      }

      // Add Mark as Served button
      if (person.status === "serving") {
        const servedBtn = document.createElement("button");
        servedBtn.textContent = "Mark as Served";
        servedBtn.onclick = () => updateStatus(person.id, "served");
        li.appendChild(servedBtn);

        li.style.backgroundColor = "#fff5d1";
        li.style.borderLeft = "5px solid #facc15";
      }

      staffQueue.appendChild(li);
    });
  });

// Clear all served customers
document.getElementById("clearServedBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all served customers?")) {
    db.collection("appointments")
      .where("status", "==", "served")
      .get()
      .then(snapshot => {
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(() => {
        alert("All served customers cleared.");
      })
      .catch(error => {
        console.error("Error clearing served customers:", error);
      });
  }
});

// Logout button
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}