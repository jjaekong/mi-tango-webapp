import { LitElement, html, css } from 'lit'

export class HomePage extends LitElement {
    constructor() {
        super()
        
    }

    render() {
        return html`
        TEST
            <home-header></home-header>
        `
    }
}

customElements.define('home-page', HomePage)    