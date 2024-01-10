import { LitElement, html, css } from "lit";
import { commonHostStyles } from '../commonHostStyles.js'

export class TodaySection extends LitElement {
    static styles = [commonHostStyles, css`
        h1 {
            font-size: 1.2rem;
        }
    `]
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