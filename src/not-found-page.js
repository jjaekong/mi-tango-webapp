import { css, html, LitElement } from "lit";

export class NotFoundPage extends LitElement {

    static styles = css`
        :host {
            display: block;
            padding: 2rem;
        }
    `

    constructor() {
        super()
    }

    render() {
        return html`
            <div>404</div>
        `
    }
}

customElements.define('not-found-page', NotFoundPage)