import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { LitElement, html, css } from 'lit'
import './home/today-section.js'

export class HomePage extends LitElement {

    static styles = css`
        :host {
            display: block;
            padding: 2rem 1rem;
        }
        :host > header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 0 1rem;
            height: 2rem;
        }
        h1 {
            margin: 0;
            padding: 0;
            font-size: 1rem;
        }
        .profile {
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            display: block;
        }
    `

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
                    photoURL: user.photoURL
                }
                : null
            this.userState = 'loaded'
        })
    }

    render() {
        return html`
            <header>
                <h1>Mi Vida</h1>
                ${
                    this.userState == 'loading'
                        ? html`<span>loading</span>`
                        : this.userState == 'loaded'
                            ? this.user
                                ? html`<a href="#me"><img class="profile" src=${this.user.photoURL}></a>`
                                : html`<a href="#login">로그인</a>`
                            : null
                }
            </header>
            <today-section></today-section>
        `
    }
}

customElements.define('home-page', HomePage)