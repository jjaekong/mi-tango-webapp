import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import './firebase.js'

document.getElementById('signin-with-google')?.addEventListener('click', () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
        .then(result => {
            location.href = ''
        })
        .catch(error => {
            console.log(error)
        })
})