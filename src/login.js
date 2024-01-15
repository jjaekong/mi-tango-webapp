import './firebase_init.js'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'

document.getElementById('signin-with-google')?.addEventListener('click', () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
        .then(result => {
            location.replace('/')
        })
        .catch(error => {
            console.log(error)
        })
})

window.addEventListener('load', function() {
    document.getElementById('loading').classList.add('hidden')
})