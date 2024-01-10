import { html, LitElement } from "lit";

export class NotFoundPage extends LitElement {
    constructor() {
        super()
    }

    render() {
        return html`404`
    }
}

customElements.define('not-found-page', NotFoundPage)