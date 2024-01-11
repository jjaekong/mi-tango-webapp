import { readFileSync } from "fs";
import { css, unsafeCSS } from "lit";

var data = readFileSync('styles.css', "utf8");

console.log(data)

export const styles = css`
    ${unsafeCSS(data)}
`