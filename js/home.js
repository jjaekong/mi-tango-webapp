import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3.1.0/+esm'

export class AppHome extends LitElement {
    constructor() {
        super()
    }
    
    render() {
        return html`APP HOME`
    }
}

customElements.define('app-home', AppHome)