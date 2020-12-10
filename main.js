let express = require('express');
let app = express();
let bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({extended: false}));

let logger = function(req, resp, next){
    console.log(req.url);
    console.log(req.method);

    next();
}

let sayhello = (req, resp) => {
    resp.send("HEllo world");
}

let saynamaste = (req, resp) => {
    resp.send("Namaste India");
}

app.use(logger);
app.use('/namaste', saynamaste);
app.use('/', sayhello);

app.listen(8081, () => {
    console.log('Server is started on 8081')
})
