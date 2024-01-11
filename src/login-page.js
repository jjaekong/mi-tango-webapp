import { html, LitElement, css } from 'lit'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithRedirect, onAuthStateChanged } from "firebase/auth";

export class LoginMain extends LitElement {

    constructor() {
        super()

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
        
        const fbApp = initializeApp(firebaseConfig);
        const analytics = getAnalytics(fbApp);

        onAuthStateChanged(getAuth(), user => {
            if (user) {
                location.replace('/')
            }
        })
    }

    signIn() {
        const provider = new GoogleAuthProvider()
        const auth = getAuth()
        signInWithRedirect(auth, provider)
            .then((result) => {
                console.log(result)
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        return html`
            <section>
                <header>
                </header>
                <main>
                    <h2>Login</h2>
                    <ul>
                        <li><button type="button" @click="${() => this.signIn('google')}">Sign in with Google</button></li>
                        <li><button type="button">TEST</button></li>
                    </ul>
                </main>
            </section>
        `
    }
}

customElements.define('login-main', LoginMain)