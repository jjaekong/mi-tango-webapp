import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { LitElement, html, css } from 'lit'
import { commonHostStyles } from './commonHostStyles.js'
import './home/today-section.js'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export class HomePage extends LitElement {
    static styles = [
        commonHostStyles,
        css`
            :host {
                display: block;
                padding: 2rem !important;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            header h1 {
                font-size: 1rem;
            }
        `
    ]

    static properties = {
        user: { type: Object },
        userState: { type: String }
    };

    constructor() {
        super()

        this.user = null
        this.userState = 'loading'

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
                <h1>Mi Vida</h1>
                ${
                    this.userState == 'loading'
                        ? html`<span>loading</span>`
                        : this.userState == 'loaded'
                            ? this.user
                                ? html`<a href="#" @click=${ history.pushState({}, "", "/me") }>${this.user.displayName}</a>`
                                : html`<a href="/login">로그인</a>`
                            : null
                }
            </header>
            <today-section></today-section>
        `
    }
}

customElements.define('home-page', HomePage)