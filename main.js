import App from './src/app.js';

const app = new App();
window.addEventListener('load', () => {
    console.log('load');
    app.init();
    // app.render();
});
