firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // If not logged in, send back to login page
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
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      if (data.type === "VIP") vipList.push(data);
      else regularList.push(data);
    });

    const fullList = [...vipList, ...regularList];
    staffQueue.innerHTML = "";
    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${index + 1}. ${person.nickname} - ${person.type} - ${person.status}</strong>`;

if (index === 0 && person.status === "serving") {
  const badge = document.createElement("span");
  badge.textContent = "⭐ Currently Serving";
  badge.style.marginLeft = "10px";
  badge.style.color = "#d97706";
  badge.style.fontWeight = "bold";
  li.appendChild(badge);
  li.style.border = "2px solid #facc15";
  li.style.backgroundColor = "#fffbe6";
}

      if (person.status === "waiting") {
        const serveBtn = document.createElement("button");
        serveBtn.textContent = "Serving";

        // ✅ Ask for PIN before marking as serving
        serveBtn.onclick = () => {
          const enteredPin = prompt("Enter customer PIN:");
          if (!enteredPin) return;

          // Fetch the latest PIN from Firestore
          db.collection("appointments").doc(person.id).get().then(doc => {
            if (doc.exists) {
              const appointmentData = doc.data();
              if (appointmentData.pin === enteredPin) {
                updateStatus(person.id, "serving");
              } else {
                alert("❌ Incorrect PIN. Cannot proceed.");
              }
            } else {
              alert("❌ Appointment not found.");
            }
          }).catch(error => {
            console.error("Error verifying PIN:", error);
            alert("⚠️ Error checking PIN.");
          });
        };

        li.appendChild(serveBtn);
      }

      if (person.status === "serving") {
        const servedBtn = document.createElement("button");
        servedBtn.textContent = "Mark as Served";
        servedBtn.onclick = () => updateStatus(person.id, "served");
        li.appendChild(servedBtn);
        li.style.background = "#fff5d1";
      }

      if (person.status === "served") {
        li.classList.add("served");
      }

      staffQueue.appendChild(li);
    });
  });

// ✅ Clear served customers
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
        alert("✅ All served customers cleared.");
      })
      .catch(error => {
        console.error("Error clearing served customers:", error);
        alert("⚠️ Failed to clear served customers.");
      });
  }
});

// ✅ Logout button
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}