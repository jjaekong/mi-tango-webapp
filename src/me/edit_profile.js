import { html } from "lit-html";
import { header } from '../components/header.js'
import { arrowLeft } from "../icons.js";

header({
    left: html`<a href="#" @click="${(e) => {
            e.preventDefault();
            history.back();
        }}">${arrowLeft({size: "size-6"})}</a>`,
    title: '내 프로필'
})