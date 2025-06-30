import "./style.css";
// import typescriptLogo from "./typescript.svg";
// import viteLogo from "/vite.svg";
// import { setupCounter } from './counter.ts'
//

// document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       ????
//     </p>
//   </div>
// `;

const main = async () => {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (app) {
    const button = document.createElement("button");
    button.textContent = "hello old school";
    app.appendChild(button);
  }
};
main();

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
