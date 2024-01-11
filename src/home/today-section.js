import { LitElement, html, css } from "lit";

export class TodaySection extends LitElement {

    static styles = css`
        :host {
            display: block;
            background: #fff;
            padding: 1rem;
            border-radius: 1rem;
            box-shadow: 1px 1px 2rem rgba(0, 0, 0, .05)
        }
        h1 {
            font-size: 1.2rem;
        }
    `
    
    constructor() {
        super()
    }
    
    render() {
        return html`
            <style>@import url(styles.css)</style>
            <section>
                <header>
                    <h1>Today</h1>
                </header>
            </section>
        `
    }
}

customElements.define('today-section', TodaySection);