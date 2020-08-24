const express=require('express')


const app=express();
    app.use('/users', (req, res, next)=>{
        console.log("mid2");
        res.send('<h1>HEHEHE</h1>')
    })
app.use('/', (req, res, next)=>{
    console.log("mid1");
    res.send("<h1>Main page</h1>");
})
app.listen(3000)
