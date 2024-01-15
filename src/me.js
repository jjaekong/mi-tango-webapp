import { html, render } from 'lit-html'
import './firebase_init.js'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'