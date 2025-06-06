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
        const serveBtn = document.createElement("button");
        serveBtn.textContent = "Serving";
        serveBtn.onclick = () => updateStatus(person.id, "serving");
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
