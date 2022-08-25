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
        this.app.get('/info', this.info_page.bind(this)); //info
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
        this.app.get('/isLogWho', this.isLogWho.bind(this));
        this.app.post('/register', this.register.bind(this));
        this.app.post('/auth', this.login.bind(this)); //Login
        this.app.post('/logout', this.logout.bind(this));
        this.app.get('/searchUser', this.searchUser.bind(this));
        this.app.get('/searchRoadmap', this.searchRoadmap.bind(this));
        this.app.get('/getBestRoadmap', this.getBestRoadmap.bind(this));
        this.app.get('/getMap', this.getMap.bind(this));
        this.app.get('/getExNovoStages', this.getExNovoStages.bind(this));
        this.app.get('/getDataUser', this.getDataUser.bind(this));
        this.app.get('/getRoadmapCreate', this.getRoadmapCreate.bind(this));
        this.app.get('/getRoadmapSeguite', this.getRoadmapSeguite.bind(this));
        this.app.get('/getRoadmapPreferite', this.getRoadmapPreferite.bind(this));
        this.app.post('/createRoadmap', this.createRoadmap.bind(this));
        this.app.get('/getPlaceInfo', this.getPlaceInfo.bind(this));
        this.app.get('/getPlaceFromCoords', this.getPlaceFromCoords.bind(this));
        this.app.post('/getRoute', this.getRoute.bind(this));
        this.app.get('/view_roadmap', this.view_roadmap.bind(this));
        this.app.get('/viewrm', this.viewrm.bind(this));
        this.app.get('/getRecCom', this.getRecCom.bind(this));

       

        this.app.post('/updateAvatar', this.updateAvatar.bind(this));
        this.app.post('/getMarkersFromRect', this.getMarkersFromRect.bind(this))
    
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

    async isLogWho(req, res) {
        var r
        if (req.session.loggedin) {
            r = { ok: true, whoLog: req.session.user_id }

            return res.send(JSON.stringify(r))
        }
        else {
            r = { ok: false, whoLog: null }

            return res.send(JSON.stringify(r))
        }
    }

    async register(req, res) {
        console.log(req.body);
        const r = await this.controller.register(req.body.username, req.body.password, req.body.email, req.body.birthdate);
        console.log(r);
        if (r.ok) {
            req.session.loggedin = true;
            req.session.user_id = r.data.insertId;
            req.session.username = req.body.username;
        }

        return res.send(JSON.stringify(r));; //ritorna il risultato della send se ha avuto errori o no??
    }

    async login(req, res) {
        const r = await this.controller.login(req.body.username, req.body.password);
        //console.log(r)
        if (r.ok) {
            req.session.loggedin = true;
            req.session.username = r.data.username;
            req.session.user_id = r.data.id;
            req.session.isAdmin = r.data.isAdmin;
            req.session.avatar = r.data.avatar;
            req.session.placeDetails = {}
            req.session.distanceDetails = {}
            //req.session.userType = 0, 1, 2, 3.  
            //Questa info ce l'ha il server quindi non ci sono problemi di sicurezza!
        }
        return res.send(JSON.stringify(r));
    }
    async view_roadmap(req,res){
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/view_roadmap.html');
    }
    async viewrm(req,res){
        const r = await this.controller.viewRoadmap(req.query.id);
        return res.send(JSON.stringify(r));
    }
    async getRecCom(req,res){
        const r = await this.controller.getRecCom(req.query.id);
        return res.send(JSON.stringify(r));
    }
    
    async getMap(req, res) {
        const r = await this.controller.getMap();
        return res.send(r);
    }

    async logout(req, res) {
        console.log("req.session=", req.session)
        console.log("req.session.user_id=", req.session.user_id)
        console.log("req.body=", req.body)

        if (req.body.id == req.session.user_id) { //richiesta giusta
            req.session.loggedin = false //elimino la sessione. come se avessimo eliminato l'oggetto Utente Autenticato
            req.session.username = ''
            req.session.user_id = '0'
            console.log("req.session=", req.session)
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
        3) aggiungere i link tra roadmap e stage in stage_in_roadmap entity. + route
        */

        if (req.session.loggedin || true) { // || TRUE VA TOLTO!! solo per testare  
            //const user_id = req.session.id; //qua da aggiustare in login!!
            const user_id = 1;

            console.log(req.session.distanceDetails)
            const r = await this.controller.createRoadmap(user_id, req.body, req.session.placeDetails, req.session.distanceDetails);
            //const 
            if (r.ok) {
                console.log("OK ROADMAP")
            }
            //qua si svuota tutto!
            //req.session.placeDetails = {} //svuotamento session troppo piccola?
            return res.send(JSON.stringify(r))
        }
        return res.send(JSON.stringify({ ok: false, error: -666 })) //USER IS NOT LOGGED IN!
    }


    async getExNovoStages(req, res) {
        const r = await this.controller.getExNovoStages();
        return res.send(r);
    }


    async getDataUser(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getDataUser(req.session.user_id);
            return res.send(JSON.stringify(r));
        }
    }

    async getRoadmapCreate(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getRoadmapCreate(req.session.user_id);
            return res.send(JSON.stringify(r));
        }
    }

    async getRoadmapSeguite(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getRoadmapSeguite(req.session.user_id);
            return res.send(JSON.stringify(r));
        }
    }

    async getRoadmapPreferite(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.getRoadmapPreferite(req.session.user_id);
            return res.send(JSON.stringify(r));
        }
    }

    async getPlaceInfo(req, res) {
        if (req.session.loggedin || true) { // da mettere!
            const isExNovo = 0;
            const r = await this.controller.getPlaceInfo(req.query.placeId);

            if (r.ok) 
            {
                req.session.placeDetails[req.query.placeId] = [r.data, isExNovo];
            }

            return res.send(JSON.stringify(r));
        }
    }

    async getPlaceFromCoords(req, res) {
        if (req.session.loggedin || true) { // da mettere!
            const isExNovo = 1;
            const r = await this.controller.getPlaceFromCoords(req.query.lat, req.query.lng);
            if (r.ok) {
                console.log(r.data.place_id)
                if (req.session.placeDetails === undefined)
                    req.session.placeDetails = {}
                req.session.placeDetails[r.data.place_id] = [r.data, isExNovo];
            }
            return res.send(JSON.stringify(r));
        }
    }


    async getRoute(req, res) {
        if (req.session.loggedin || true) { // da mettere!
            const r = await this.controller.getRoute(req.body.origin, req.body.destination, req.body.travelMode);
            if (r.ok) 
            { 
                req.session.distanceDetails[req.body.origin + "|" + req.body.destination] = r.data;
            }
            return res.send(JSON.stringify(r));
        }
    }

    async updateAvatar(req, res) {
        if (req.session.loggedin) {
            const r = await this.controller.updateAvatar(req.session.user_id, req.body.new_avatar);
            console.log(r)
            return res.send(JSON.stringify(r));
        }
    }

    async getMarkersFromRect(req, res) {
        if (req.session.loggedin | true) { //MOMENTANEO TRUE
            const r = await this.controller.getMarkersFromRect(req.body.centerLatInf, req.body.centerLatSup, req.body.centerLngInf, req.body.centerLngSup);
            return res.send(JSON.stringify(r));
        }
    }

    async searchUser(req, res) {

        const r = await this.controller.searchUser(req.query.username);
        return res.send(JSON.stringify(r));
    }

    async searchRoadmap(req, res) {
        const r = await this.controller.searchRoadmap(req.query.ricerca);
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

    async info_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/info.html');
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
        if (req.session.loggedin !== undefined & req.session.loggedin == true) {
            return res.sendFile(__dirname + '/static/create.html');
            console.log('user session is alive')
        }else{
            return res.sendFile(__dirname + '/static/create.html');
        }
        
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