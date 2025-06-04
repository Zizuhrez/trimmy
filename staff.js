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
      li.textContent = `${index + 1}. ${person.nickname} - ${person.type} - ${person.status}`;

      if (person.status === "waiting") {
  // Serve with PIN
  const serveBtn = document.createElement("button");
  serveBtn.textContent = "Serving";
  serveBtn.onclick = () => {
    const inputPin = prompt("Enter customer's 4-digit PIN:");
    if (inputPin === String(person.pin)) {
      updateStatus(person.id, "serving");
    } else {
      alert("Incorrect PIN. You cannot serve this customer.");
    }
  };
  li.appendChild(serveBtn);

  // Show PIN (hidden by default)
  const showPinBtn = document.createElement("button");
  showPinBtn.textContent = "👁 Show PIN";
  const pinSpan = document.createElement("span");
  pinSpan.textContent = `PIN: ${person.pin}`;
  pinSpan.style.display = "none";
  pinSpan.style.marginLeft = "10px";
  showPinBtn.onclick = () => {
    pinSpan.style.display = pinSpan.style.display === "none" ? "inline" : "none";
  };
  li.appendChild(showPinBtn);
  li.appendChild(pinSpan);

  // Override PIN (use carefully)
  const overrideBtn = document.createElement("button");
  overrideBtn.textContent = "Override PIN";
  overrideBtn.onclick = () => {
    if (confirm("Are you sure you want to override the PIN check for this customer?")) {
      updateStatus(person.id, "serving");
    }
  };
  li.appendChild(overrideBtn);
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
