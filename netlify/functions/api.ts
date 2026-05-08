// @ts-nocheck
// Importamos desde el JS ya compilado por NestJS (que conserva los decoradores)
// en lugar de usar el TS original, porque el bundler de Netlify rompe la inyección de dependencias.
const lambda = require('../../backend/dist/src/lambda');
export const handler = lambda.handler;
