import { html, LitElement } from "lit";

export class MeMain extends LitElement {
    constructor() {
        super()
    }

    render() {
        return html`
            me main
        `
    }
}

customElements.define('me-main', MeMain)