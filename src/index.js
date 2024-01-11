import { html, LitElement } from "lit";
import "./home-page.js";
import "./me-page.js";
import "./login-page.js";
import "./not-found-page.js";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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

export class MiTango extends LitElement {

    static properties = {
        page: { type: String }
    }

    setPage() {
        location.pathname === "/"
            ? location.hash === ''
                ? this.page = '#home'
                : this.page = location.hash
            : this.page = '#not-found'
    }

    constructor() {
        super()
        this.setPage()
        onhashchange = () => this.setPage();        
    }

    connectedCallback() {
        super.connectedCallback()
        console.log('connectedCallback')
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        console.log('disconnectedCallback')
    }

    attributeChangedCallback() {
        super.attributeChangedCallback()
        console.log('attributeChangedCallback')
    }

    adoptedCallback() {
        super.adoptedCallback()
        console.log('adoptedCallback')
    }

    render() {
        if (this.page == '#home')
            return html`<home-page></home-page>`
        else if (this.page == '#me')
            return html`<me-page></me-page>`
        else if (this.page == '#login')
            return html`<login-page></login-page>`
        else if (this.page == '#not-found')
            return html`<not-found-page></not-found-page>`
        else
            return html`<not-found-page></not-found-page>`
    }
}

customElements.define('mi-tango', MiTango)