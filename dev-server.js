const { App, createStaticHandler } = require('herver'),
    { join } = require('path');

const PORT = 8080;

const app = new App();

app.use(createStaticHandler(join(__dirname, 'src')))
    .use(createStaticHandler(join(__dirname, 'test')))
    .use(createStaticHandler(join(__dirname, 'public')));

app.listen(PORT);

console.log(`Dev server started at localhost:${PORT}`);
console.log('(Hit Ctrl-C to stop)');
