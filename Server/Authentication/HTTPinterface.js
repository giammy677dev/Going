const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestController = require('./requestController.js');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
const config = require('./config.js');
const { res } = require('express');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class HTTPinterface {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);

        this.controller = new requestController()
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

        this.app.use(session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        }));

        //front end pages
        //this.app.get('/', this.main_page.bind(this)); //MainPage
        this.app.get('/', this.home_page.bind(this)); //HomePage
        this.app.get('/about', this.about_page.bind(this)); //about
        this.app.get('/create', this.createRoadmap_page.bind(this)); //Create Roadmap
        this.app.get('/explore', this.explore_page.bind(this)); //Esplora
        this.app.get('/login', this.login_page.bind(this)); //LoginRegistrati
        this.app.get('/profile', this.profile_page.bind(this)); //Profilo
        this.app.get('/diego', this.diego.bind(this)); //Easter Egg
        this.app.use('/static', express.static('static')); //HTML e CSS pages
        this.app.use('/storage', express.static('storage')); //Images and other

        //back end calls
        this.app.post('/register', this.register.bind(this));
        this.app.post('/auth', this.login.bind(this)); //Login
        this.app.post('/logout', this.logout.bind(this));
        this.app.get('/searchUser', this.searchUser.bind(this));
        this.app.get('/getBestRoadmap', this.getBestRoadmap.bind(this));
        this.app.get('/getMap', this.getMap.bind(this));
        this.app.post('/getExNovoStages', this.getExNovoStages.bind(this));
        this.app.get('/getDataUser', this.getDataUser.bind(this));

        // http://localhost:3000/home
        this.app.get('/home', function (req, res) {
            // If the user is loggedin
            if (req.session.loggedin) {
                // Output username
                console.log(req.session);
                res.send('Welcome back, ' + req.session.username + '!');
            }
            else {
                // Not logged in
                res.send('Please login to view this page!');
            }
            res.end();
        });
    }

    async register(req, res) {
        console.log(req.body);
        const r = await this.controller.register(req.body.username, req.body.password, req.body.email, req.body.birthdate);
        return res.send(JSON.stringify(r));; //ritorna il risultato della send se ha avuto errori o no??
    }

    async login(req, res) {
        const r = await this.controller.login(req.body.username, req.body.password);
        console.log(r)
        if (r.ok) {
            req.session.loggedin = true;
            req.session.username = r.data.username;
            req.session.id = r.data.id;
            req.session.isAdmin = r.data.isAdmin;
            //req.session.userType = 0, 1, 2, 3.  
            //Questa info ce l'ha il server quindi non ci sono problemi di sicurezza!
        }
        return res.send(JSON.stringify(r));
    }

    async getMap(req, res) {
        const r = await this.controller.getMap();
        return res.send(r);
    }

    async logout(req, res) {
        if(req.body.username == req.session.username){ //richiesta giusta
            req.session.loggedin = false //elimino la sessione. come se avessimo eliminato l'oggetto Utente Autenticato
            req.session.username = ''
            //non uso req.session = {} perché nella sessione possono esserci anche altre info!
            return res.send({ok:true})
        }
        return res.send({ok:false})
        //nessuna chiamata al DB.
    }

    async getExNovoStages(req, res) {
        const r = await this.controller.getExNovoStages();
        console.log(r)
        return res.send(r);
    }

    async getDataUser(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getDataUser(req.session.id);
            console.log(r)
            return res.send(r);
        } 
    }

    async searchUser(req, res) {
        const r = await this.controller.searchUser(req.query.username);
        return res.send(JSON.stringify(r));
    }

    async getBestRoadmap(req, res) {
        const r = await this.controller.getBestRoadmap();
        return res.send(JSON.stringify(r));
    }
    
    async main_page(req, res)
    {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/main.html');
    }

    async home_page(req, res)
    {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Homepage.html');
    }

    async about_page(req, res) {
        if (req.user)
        {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/about.html');
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
        return res.sendFile(__dirname + '/static/create.html');
    }

    async login_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Login.html');
    }

    async profile_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Profile.html');
    }

    async diego(req, res) {
        //console.log(req.query.DIEGO)
        //res.send(req.query.DIEGO)
        return res.sendFile(__dirname + '/static/Sito/About.html');
    }
}

module.exports = HTTPinterface;