import './firebase_init.js'
import { render, html } from "lit-html";
import { getAuth, onAuthStateChanged } from 'firebase/auth'


onAuthStateChanged(getAuth(), user => {
	if (user) {
		
	} else {
		
	}
})