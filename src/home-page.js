import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { LitElement, css, html } from 'lit'
import './home/today-section.js'
import { styles } from './styles.js'

export class HomePage extends LitElement {

    static styles = [styles]

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
                                ? html`<a href="#me"><img class="profile block p-5" src=${this.user.photoURL}></a>`
                                : html`<a href="#login">로그인</a>`
                            : null
                }
            </header>
            <div></div>
            <today-section></today-section>
        `
    }
}

customElements.define('home-page', HomePage)