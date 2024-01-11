import { html, LitElement, css } from 'lit'
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export class LoginPage extends LitElement {

    static styles = css`
        :host {
            display: block;
            padding: 2rem;
        }
        h1 {
            margin: 0 0 2rem;
            padding: 0;
            font-size: 2rem;
            text-align: center;
        }
        ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
    `

    constructor() {
        super()
    }

    signIn() {
        const provider = new GoogleAuthProvider()
        const auth = getAuth()
        signInWithPopup(auth, provider)
            .then(result => {
                console.log(result)
                location.replace('/')
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        return html`
            <header>
                <h1>LOGIN</h1>
            </header>
            <ul>
                <li><button type="button" @click="${() => this.signIn('google')}">Sign in with Google</button></li>
                <li><button type="button">TEST</button></li>
            </ul>
        `
    }
}

customElements.define('login-page', LoginPage)