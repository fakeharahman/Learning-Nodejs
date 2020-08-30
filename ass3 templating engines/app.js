const express= require('express');
const bodyParser=require('body-parser');
// const ejs=require('ejs')

const app=express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: false}))
const users=[];

app.get('/', (req, res, next)=>{
    res.render('index', {title: 'enter user'})
})
app.post('/users', (req, res, next )=>{
users.push(req.body);
console.log(users)
res.redirect('/')
})
app.get('/users', (req, res, next)=>{
 res.render("users", { title: "users", users: users });
})

app.listen(8080)