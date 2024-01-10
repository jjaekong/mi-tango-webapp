import { LitElement, html, css } from 'lit'
import { commonHostStyles } from './commonHostStyles.js'
import './home/today-section.js'

export class HomePage extends LitElement {
    static styles = [
        commonHostStyles,
        css`
            :host {
                display: block;
                padding: 1rem !important;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;

            }
        `
    ]

    constructor() {
        super()
        
    }

    render() {
        return html`
            <header>
                <h1>Mi Vida</h1>
                <a href="login.html">로그인</a>
            </header>
            <today-section></today-section>
        `
    }
}

customElements.define('home-page', HomePage)    