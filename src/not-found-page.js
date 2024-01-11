import { html, LitElement } from "lit";

export class NotFoundPage extends LitElement {
    constructor() {
        super()
    }

    render() {
        return html`
            <style>@import url(styles.css)</style>
            <div>404</div>
        `
    }
}

customElements.define('not-found-page', NotFoundPage)