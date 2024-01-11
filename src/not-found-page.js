import { html, LitElement } from "lit";

export class NotFoundPage extends LitElement {
    constructor() {
        super()
    }

    render() {
        return html`<div>404</div>`
    }
}

customElements.define('not-found-page', NotFoundPage)