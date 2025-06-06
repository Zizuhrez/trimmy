const firebaseConfig = {
  apiKey: "AIzaSyCBZieIBuGS_ZTIQgedZCQgV5zg8KxexUQ",
  authDomain: "trimmy-9befa.firebaseapp.com",
  projectId: "trimmy-9befa",
  storageBucket: "trimmy-9befa.appspot.com", // ✅ fixed here
  messagingSenderId: "1004261096048",
  appId: "1:1004261096048:web:b1919461d044a91f6892b5",
  measurementId: "G-TCTDHB8SWL"
};

firebase.initializeApp(firebaseConfig);


window.db = firebase.firestore();
