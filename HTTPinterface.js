const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
//const RequestController = require('./requestController.js');

const config = require('./config.js');

class HTTPinterface{
    constructor(){
        this.app = express();
        this.server = http.createServer(this.app);

        //this.controller = new RequestController()
        this.initServer();
    
        this.port = config.port;
        
        this.server.listen(process.env.PORT || this.port, () => {
            console.log(`HTTP auth Server started on port ${this.server.address().port} :)`);
        });
    }
    
    initServer(){
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(cors({origin: '*'}));
        this.app.post('/register', this.register.bind(this));
        this.app.post('/login', this.login.bind(this));
        this.app.post('/logout', this.logout.bind(this));
        this.app.post('/checkToken', this.checkToken.bind(this));
        this.app.get('/diego', this.diego.bind(this));
        this.app.use('/static', express.static('static'));
        this.app.post('/activate', this.activate.bind(this)); 
    }

    async register(req, res){
        const r = await this.controller.register(req.body.userName, req.body.password, req.body.email, req.body.prk, req.body.puk);
        res.send(JSON.stringify(r));
    }
    
    async diego(req,res)
    {
        console.log(req.query.DIEGO)
        res.send(req.query.DIEGO)
    }

    async login(req, res){
        const r = await this.controller.login(req.body.userName, req.body.password);
        res.send(JSON.stringify(r));
    }

    async logout(req, res){
        const r = await this.controller.logout(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async checkToken(req, res){
        const r = await this.controller.checkToken(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async activate(req, res){
        const r = await this.controller.activate(req.body.id);
        res.send(JSON.stringify(r));
    }
}

module.exports = HTTPinterface;