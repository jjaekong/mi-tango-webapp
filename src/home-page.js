import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { LitElement, html, css } from 'lit'

export class HomePage extends LitElement {

    static properties = {
        user: { type: Object },
        userState: { type: String }
    };

    constructor() {
        super()

        this.user = null
        this.userState = 'loading'
        
        onAuthStateChanged(getAuth(), user => {
            this.user = user
                ? {
                    displayName: user.displayName,
                    email: user.email,
                    emailVerified: user.emailVerified,
                }
                : null
            this.userState = 'loaded'
        })
    }

    render() {
        return html`
            <header>
                <h1>Mi Vida1</h1>
                ${
                    this.userState == 'loading'
                        ? html`<span>loading</span>`
                        : this.userState == 'loaded'
                            ? this.user
                                ? html`<a href="#me">${this.user.displayName}</a>`
                                : html`<a href="#login">로그인</a>`
                            : null
                }
            </header>
        `
    }
}

customElements.define('home-page', HomePage)