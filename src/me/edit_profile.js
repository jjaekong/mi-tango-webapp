import { html } from "lit-html";
import { toolbar } from '../components/toolbar.js'
import { arrowLeft } from "../icons.js";

toolbar({
    left: html`<a href="#" @click="${(e) => {
            e.preventDefault();
            history.back();
        }}">${arrowLeft({size: "size-6"})}</a>`,
    title: '내 프로필'
})