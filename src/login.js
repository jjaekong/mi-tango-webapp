import './firebase.js'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'

document.getElementById('signin-with-google')?.addEventListener('click', () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    signInWithRedirect(auth, provider)
        .then(result => {
            location.replace('/')
        })
        .catch(error => {
            console.log(error)
        })
})