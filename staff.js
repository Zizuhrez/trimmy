const staffList = document.getElementById("staffQueue");

db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id; // save ID for later
      if (data.status === "served") return;
      if (data.type === "VIP") vipList.push(data);
      else regularList.push(data);
    });

    const fullList = [...vipList, ...regularList];
    staffList.innerHTML = "";
    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${person.nickname} - ${person.type} - ${person.status} `;

      // Add Serve button
      const serveBtn = document.createElement("button");
      serveBtn.textContent = "Serve";
      serveBtn.onclick = async () => {
        const enteredPIN = prompt("Enter customer PIN:");
        if (enteredPIN === String(person.pin)) {
          await db.collection("appointments").doc(person.id).update({
            status: "serving"
          });
          alert(`Now serving ${person.nickname}`);
        } else {
          alert("Incorrect PIN ❌");
        }
      };

      li.appendChild(serveBtn);
      staffList.appendChild(li);
    });
  });