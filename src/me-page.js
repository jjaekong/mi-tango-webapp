import { getAuth, signOut } from "firebase/auth";
import { css, html, LitElement } from "lit";

export class MePage extends LitElement {
    static styles = [css`
        :host { display: block; padding: 2rem; }
    `]

    constructor() {
        super()
    }

    logout() {
        if (confirm('로그아웃 하겠습니까?')) {
            signOut(getAuth())
                .then(() => {
                    location.href = '/#home'
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    render() {
        return html`
            <style>@import url(styles.css)</style>
            <h1>me main</h1>
            <a href="#" @click=${e => { e.preventDefault(); this.logout() }}>로그아웃</a>
        `
    }
}

customElements.define('me-page', MePage)