// Redirect to login if not authenticated
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

const staffQueue = document.getElementById("staffQueue");

// Function to update appointment status in Firestore
function updateStatus(docId, newStatus) {
  db.collection("appointments").doc(docId).update({ status: newStatus });
}

// Real-time listener for appointments
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

    fullList.forEach((person) => {
      const li = document.createElement("li");
      li.classList.add("queue-item");

      const infoDiv = document.createElement("div");
      infoDiv.classList.add("customer-info");
      infoDiv.textContent = `${person.nickname} (${person.type})`;

      li.appendChild(infoDiv);

      if (person.status === "waiting") {
        const serveBtn = document.createElement("button");
        serveBtn.textContent = "Serve";
        serveBtn.classList.add("serve-btn");

        serveBtn.onclick = () => {
          const enteredPin = prompt("Enter customer PIN:");
          if (enteredPin === person.pin.toString()) {
            updateStatus(person.id, "serving");
          } else {
            alert("Incorrect PIN. Cannot proceed.");
          }
        };

        li.appendChild(serveBtn);
      }

      if (person.status === "serving") {
        const markBtn = document.createElement("button");
        markBtn.textContent = "Mark as Served";
        markBtn.classList.add("mark-btn");

        markBtn.onclick = () => {
          const confirmMark = confirm(`Mark ${person.nickname} as served?`);
          if (confirmMark) {
            updateStatus(person.id, "served");
          }
        };

        li.appendChild(markBtn);
      }

      staffQueue.appendChild(li);
    });
  });

// Clear all served customers button
document.getElementById("clear-Btn").addEventListener("click", () => {
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

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
