import { getAuth, GoogleAuthProvider, signInWithPopup } from "@firebase/auth"

export const Login = () => {
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
}