import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen( PORT, ()=> {
  console.log('app liseten at PORT:', PORT);
});

export default app;