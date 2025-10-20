
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB7W5S8BfA6S1dCCVKV-1vnKdqKVQDGraU",
    authDomain: "random-e7283.firebaseapp.com",
    projectId: "random-e7283",
    storageBucket: "random-e7283.firebasestorage.app",
    messagingSenderId: "956713979525",
    appId: "1:956713979525:web:4734ac945c7c6e72c5e3ec",
    measurementId: "G-JBWW5H15NG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);