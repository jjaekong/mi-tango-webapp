import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBjlBi8FCJF2CHKQcOx7OrN9J3PFM7_iyg",
  authDomain: "mi-tango-365.firebaseapp.com",
  databaseURL: "https://mi-tango-365-default-rtdb.firebaseio.com",
  projectId: "mi-tango-365",
  storageBucket: "mi-tango-365.appspot.com",
  messagingSenderId: "956666689230",
  appId: "1:956666689230:web:9857a6d2027b587fee829f",
  measurementId: "G-Q9KPWCTZ9N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);