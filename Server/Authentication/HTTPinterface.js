const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
//const RequestController = require('./requestController.js');

const config = require('./config.js');

class HTTPinterface {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);

        //this.controller = new RequestController()
        this.initServer();

        this.port = config.port;

        this.server.listen(process.env.PORT || this.port, () => {
            console.log(`HTTP auth Server started on port ${this.server.address().port} :)`);
        });

    }

    initServer() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(cors({ origin: '*' }));

        //front end pages
        this.app.get('/', this.main_page.bind(this)); //MainPage
        this.app.get('/createRoadmap', this.createRoadmap_page.bind(this)); //Create Roadmap
        this.app.get('/explore', this.explore_page.bind(this)); //Esplora
        this.app.get('/login', this.login_page.bind(this)); //LoginRegistrati
        this.app.get('/profile', this.profile_page.bind(this)); //Profilo
        this.app.get('/diego', this.diego.bind(this));
        this.app.use('/static', express.static('static'));
        this.app.use('/storage', express.static('storage'));

        //back end calls
        this.app.post('/register', this.register.bind(this));
        this.app.post('/login', this.login.bind(this));
        this.app.post('/logout', this.logout.bind(this));
        this.app.post('/checkToken', this.checkToken.bind(this));
        this.app.post('/activate', this.activate.bind(this));
    }

    async main_page(req, res) 
    {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Main_Page.html');
    }

    async explore_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Explore.html');
    }

    async createRoadmap_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Create_Roadmap.html');
    }

    async login_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Login.html');
    }

    async profile_page(req, res)
    {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Profile.html');
    }

    async register(req, res) 
    {
        const r = await this.controller.register(req.body.userName, req.body.password, req.body.email, req.body.prk, req.body.puk);
        res.send(JSON.stringify(r));
    }

    async diego(req, res) {
        //console.log(req.query.DIEGO)
        //res.send(req.query.DIEGO)
        return res.sendFile(__dirname + '/static/Sito/About.html');
    }

    async login(req, res) {
        const r = await this.controller.login(req.body.userName, req.body.password);
        res.send(JSON.stringify(r));
    }

    async logout(req, res) {
        const r = await this.controller.logout(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async checkToken(req, res) {
        const r = await this.controller.checkToken(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async activate(req, res) {
        const r = await this.controller.activate(req.body.id);
        res.send(JSON.stringify(r));
    }
}

module.exports = HTTPinterface;