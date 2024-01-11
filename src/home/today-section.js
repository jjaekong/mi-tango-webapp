import { LitElement, html, css } from "lit";

export class TodaySection extends LitElement {
    
    constructor() {
        super()
    }
    
    render() {
        return html`
            <section>
                <header>
                    <h1>Today</h1>
                </header>
            </section>
        `
    }
}

customElements.define('today-section', TodaySection);