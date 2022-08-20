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
        this.app.get('/signup', this.signup_page.bind(this)); //Registrati
        this.app.get('/profile', this.profile_page.bind(this)); //Profilo
        this.app.get('/diego', this.diego.bind(this)); //Easter Egg
        this.app.use('/static', express.static('static')); //HTML e CSS pages
        this.app.use('/storage', express.static('storage')); //Images and other
        this.app.use('/avatar', express.static('avatar')); //avatars

        //back end calls
        this.app.post('/register', this.register.bind(this));
        this.app.post('/auth', this.login.bind(this)); //Login
        this.app.post('/logout', this.logout.bind(this));
        this.app.get('/searchUser', this.searchUser.bind(this));
        this.app.get('/getBestRoadmap', this.getBestRoadmap.bind(this));
        this.app.get('/getMap', this.getMap.bind(this));
        this.app.get('/getExNovoStages', this.getExNovoStages.bind(this));
        this.app.get('/getDataUser', this.getDataUser.bind(this));
        this.app.get('/getNumberRoadmapCreate', this.getNumberRoadmapCreate.bind(this));
        this.app.get('/getNumberRoadmapSeguite', this.getNumberRoadmapSeguite.bind(this));
        this.app.get('/getNumberRoadmapPreferite', this.getNumberRoadmapPreferite.bind(this));
        this.app.post('/createRoadmap', this.createRoadmap.bind(this));
        this.app.get('/getPlaceInfo', this.getPlaceInfo.bind(this));

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
            req.session.user_id = r.data.id;
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
        if (req.body.username == req.session.username) { //richiesta giusta
            req.session.loggedin = false //elimino la sessione. come se avessimo eliminato l'oggetto Utente Autenticato
            req.session.username = ''
            //non uso req.session = {} perché nella sessione possono esserci anche altre info!
            return res.send({ ok: true })
        }
        return res.send({ ok: false })
        //nessuna chiamata al DB.
    }

    async createRoadmap(req, res) {
        //create roadmap deve fare 3 cose
        /*
        1) aggiungere roadmap con i parametri specificati dall'utente all'entità ROADMAP
        2) aggiungere tutti i nuovi stage (ex novo + google) mai aggiunti al db all'entità STAGE
        3) aggiungere i link tra roadmap e stage in stage_in_roadmap entity.
        */

        if (req.session.loggedin || true) {  //OR TRUE SI DEVE TOGLIERE!!
            //const user_id = req.session.id; //qua da aggiustare in login!!
            const user_id = 1;
            const r = await this.controller.createRoadmap(user_id, req.body);
            //const 
            if (r.ok) {
                console.log("test")
            }
            return res.send(JSON.stringify(r))
        }
        return res.send(JSON.stringify({ ok: false, error: -666 })) //USER IS NOT LOGGED IN!
    }


    async getExNovoStages(req, res) {
        const r = await this.controller.getExNovoStages();
        console.log(r);
        return res.send(r);
    }


    async getDataUser(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getDataUser(req.session.user_id);
            console.log(r)
            return res.send(JSON.stringify(r));
        }
    }

    async getNumberRoadmapCreate(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getNumberRoadmapCreate(req.session.user_id);
            console.log(r)
            return res.send(JSON.stringify(r));
        }
    }

    async getNumberRoadmapSeguite(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getNumberRoadmapSeguite(req.session.user_id);
            console.log(r)
            return res.send(JSON.stringify(r));
        }
    }

    async getNumberRoadmapPreferite(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getNumberRoadmapPreferite(req.session.user_id);
            console.log(r)
            return res.send(JSON.stringify(r));
        }
    }

    async getPlaceInfo(req, res) {
        //if (req.session.loggedin) { // da mettere!
            const r = await this.controller.getPlaceInfo(req.query.placeId);
            console.log(r)
            console.log("test")
            return res.send(JSON.stringify(r));
        //}
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

    async home_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Homepage.html');
    }

    async about_page(req, res) {
        if (req.user) {
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

    async signup_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Signup.html');
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