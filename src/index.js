import { html, render } from 'lit-html'
import { homeTemplate } from './home'

const appEl = document.getElementById('app')
render(html`home`, appEl)

const setScreenByHash = () => {
    if (location.hash === '') {
        render(html`home`, appEl)
    } else if (location.hash === '#milonga') {
        render(html`milonga`, appEl)
    }
}

window.addEventListener('DOMContentLoaded', e => {
    setScreenByHash()
})

window.addEventListener("hashchange", e => {
    setScreenByHash()
}, false)