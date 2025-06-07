const staffQueue = document.getElementById("staffQueue");

// Function to update status in Firestore
function updateStatus(docId, newStatus) {
  db.collection("appointments").doc(docId).update({ status: newStatus });
}

// Listen for real-time updates
db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      if (data.status === "served") return; // hide served if you want
      if (data.type === "VIP") vipList.push(data);
      else regularList.push(data);
    });

    const fullList = [...vipList, ...regularList];

    staffQueue.innerHTML = "";

    fullList.forEach((person, index) => {
      const li = document.createElement("li");

      // Style for status
      li.innerHTML = `${index + 1}. <strong>${person.nickname}</strong> - ${person.type} - 
        <span style="color: ${person.status === "serving" ? "green" : "black"};">
          ${person.status}
        </span>`;

      // Serve button for waiting
      if (person.status === "waiting") {
        const serveBtn = document.createElement("button");
        serveBtn.textContent = "Serve";
        serveBtn.onclick = async () => {
          const enteredPIN = prompt(`Enter PIN for ${person.nickname}:`);
          if (enteredPIN === String(person.pin)) {
            await updateStatus(person.id, "serving");
            alert(`✅ Now serving ${person.nickname}`);
          } else {
            alert("❌ Incorrect PIN. Cannot serve.");
          }
        };
        li.appendChild(serveBtn);
      }

      // Mark as served button
      if (person.status === "serving") {
        const doneBtn = document.createElement("button");
        doneBtn.textContent = "Mark as Served";
        doneBtn.onclick = () => updateStatus(person.id, "served");
        doneBtn.style.marginLeft = "10px";
        li.appendChild(doneBtn);
        li.style.background = "#fff5d1";
      }

      staffQueue.appendChild(li);
    });
  });