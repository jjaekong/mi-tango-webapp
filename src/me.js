import { getAuth, signOut } from 'firebase/auth'
import './firebase.js'

document.querySelector('#logout')?.addEventListener('click', function() {
    if (confirm("로그아웃 하시겠습니까?")) {
        const auth = getAuth()
        signOut(auth)
            .then(() => {
                location.replace('/')
            })
            .catch(error => {
                console.log(error)
            })
    }
})