import { html, LitElement } from "lit";
import "./home-page.js";
import "./not-found-page.js";

export class MiTango extends LitElement {

    static properties = {
        page: { type: String }
    }

    constructor() {
        super()
        this.page = 'home'
    }

    render() {
        if (this.page == 'home') return html`<home-page></home-page>`
        else return html`<not-found-page></not-found-page>`
    }
}

customElements.define('mi-tango', MiTango)