const staffList = document.getElementById("staffQueue");

db.collection("appointments")
  .orderBy("timestamp")
  .onSnapshot(snapshot => {
    const vipList = [];
    const regularList = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id; // save doc ID to update later
      if (data.status === "served") return;
      if (data.type === "VIP") vipList.push(data);
      else regularList.push(data);
    });

    const fullList = [...vipList, ...regularList];
    staffList.innerHTML = "";

    fullList.forEach((person, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${index + 1}. <strong>${person.nickname}</strong> - ${person.type} - 
  <span style="color: ${person.status === 'serving' ? 'green' : 'black'};">
    ${person.status}
  </span>`;

      // 👇 Serve Button
      const serveBtn = document.createElement("button");
      serveBtn.textContent = "Serve";
      serveBtn.onclick = async () => {
        const enteredPIN = prompt("Enter customer PIN:");

        if (enteredPIN === String(person.pin)) {
          // ✅ Correct PIN → update status to "serving"
          await db.collection("appointments").doc(person.id).update({
            status: "serving"
          });
          alert(`✅ Now serving ${person.nickname}`);
        } else {
          // ❌ Incorrect PIN
          alert("❌ Incorrect PIN. Cannot serve this customer.");
        }
      };

      li.appendChild(serveBtn);

if (person.status === "serving") {
  const doneBtn = document.createElement("button");
  doneBtn.textContent = "Done";
  doneBtn.style.marginLeft = "10px";
  doneBtn.onclick = async () => {
    await db.collection("appointments").doc(person.id).update({
      status: "served"
    });
    alert(`${person.nickname} marked as served ✅`);
  };
  li.appendChild(doneBtn);
}

staffList.appendChild(li);