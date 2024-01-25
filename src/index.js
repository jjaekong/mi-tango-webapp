import { html, render } from 'lit-html'
import { homeTemplate } from './home'

render(homeTemplate(), document.getElementById('app'))