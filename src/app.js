import express from "express";

export default app = express();

app.get('/', (req, res)=> {
    return res.status(200).send('Hello from accquisittions')
});