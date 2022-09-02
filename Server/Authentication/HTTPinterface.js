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
const multer = require("multer");

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

        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(__dirname, './' + config.stagesFolder))
            },
            filename: function (req, file, cb) {
                //console.log(this.controller) this.controller= undefined. to fix.
                const split = file.originalname.split(".");
                cb(null, file.fieldname + "." + split[split.length - 1])
                //cb(null, this.controller.getFileName(file)) //assign unique name to stage img
            }
        });

        this.upload = multer({
            storage: this.storage,
            limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
            fileFilter: (req, file, cb) => {
                if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                    cb(null, true);
                } else {
                    cb(null, false);
                    const err = new Error('Only .png, .jpg and .jpeg format allowed!')
                    err.name = 'ExtensionError'
                    return cb(err);
                }
            },
        })

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
        this.app.get('/', this.home_page.bind(this)); //HomePage
        this.app.get('/info', this.info_page.bind(this)); //info
        this.app.get('/about', this.about_page.bind(this)); //about
        this.app.get('/create', this.createRoadmap_page.bind(this)); //Create Roadmap
        this.app.get('/explore', this.explore_page.bind(this)); //Esplora
        this.app.get('/signup', this.signup_page.bind(this)); //Registrati
        this.app.get('/profile', this.profile_page.bind(this)); //Profilo
        this.app.get('/adminPanel', this.admin_page.bind(this)); //Profilo
        this.app.use('/static', express.static('static')); //HTML e CSS pages
        this.app.use('/storage', express.static('storage')); //Images and other
        this.app.use('/avatar', express.static('avatar')); //avatars
        this.app.use('/stages', express.static('stages')); //avatars EX NOVO STAGE IMGS

        //back end calls
        this.app.get('/isLogWho', this.isLogWho.bind(this));
        this.app.post('/register', this.register.bind(this));
        this.app.post('/auth', this.login.bind(this)); //Login
        this.app.post('/logout', this.logout.bind(this));
        this.app.post('/searchRoadmap', this.searchRoadmap.bind(this));
        this.app.get('/searchUser', this.searchUser.bind(this));
        this.app.post('/suggestedRoadmap', this.suggestedRoadmap.bind(this));
        this.app.get('/getBestRoadmap', this.getBestRoadmap.bind(this));
        this.app.get('/getMap', this.getMap.bind(this));
        this.app.get('/getExNovoStages', this.getExNovoStages.bind(this));
        this.app.get('/getDataUser', this.getDataUser.bind(this));
        this.app.get('/getUserStatus', this.getUserStatus.bind(this));
        this.app.get('/getRoadmapCreate', this.getRoadmapCreate.bind(this));
        this.app.get('/getRoadmapSeguite', this.getRoadmapSeguite.bind(this));
        this.app.get('/getRoadmapPreferite', this.getRoadmapPreferite.bind(this));
        this.app.get('/deleteRoadmap', this.deleteRoadmap.bind(this));
        this.app.get('/updateRoadmapSeguite', this.updateRoadmapSeguite.bind(this));
        this.app.get('/updateRoadmapPreferite', this.updateRoadmapPreferite.bind(this));
        //this.app.post('/createRoadmap', this.createRoadmap.bind(this));
        this.app.get('/getPlaceInfo', this.getPlaceInfo.bind(this));
        this.app.get('/getPlaceFromCoords', this.getPlaceFromCoords.bind(this));
        this.app.post('/getRoute', this.getRoute.bind(this));
        this.app.get('/view_roadmap', this.view_roadmap.bind(this));
        this.app.get('/getRoadmapData', this.getRoadmapData.bind(this));
        this.app.get('/getCommentiRecensioni', this.getCommentiRecensioni.bind(this));
        this.app.get('/getCommmentsReviewByUserRoad', this.getCommmentsReviewByUserRoad.bind(this));
        this.app.post('/createCommento', this.createCommento.bind(this));
        this.app.post('/updateCommento', this.updateCommento.bind(this));
        this.app.post('/deleteCommento', this.deleteCommento.bind(this));
        this.app.post('/deleteStage', this.deleteStage.bind(this));
        this.app.post('/createRecensione', this.createRecensione.bind(this));
        this.app.post('/updateRecensione', this.updateRecensione.bind(this));
        this.app.post('/deleteRecensione', this.deleteRecensione.bind(this));
        this.app.post('/setRoadmapAsFavourite', this.setRoadmapAsFavourite.bind(this));
        this.app.post('/setRoadmapAsSeguita', this.setRoadmapAsSeguita.bind(this));
        this.app.post('/report', this.reportObject.bind(this));
        this.app.get('/getAchievements', this.getAchievements.bind(this));
        this.app.get('/getRoadmapAchievementsPopup', this.getRoadmapAchievementsPopup.bind(this));
        this.app.get('/getSegnalazioni', this.getSegnalazioni.bind(this));
        this.app.post('/updateSegnalazioni', this.processSegnalazioni.bind(this));
        this.app.get('/getPreferredFavouriteStatusByUserByRoadmap', this.getPreferredFavouriteStatusByUserByRoadmap.bind(this));


        this.app.post("/createRoadmap", this.upload.any(20), this.createRoadmap.bind(this)); //max 20 files?

        this.app.post('/updateAvatar', this.updateAvatar.bind(this));
        this.app.post('/getMarkersFromRect', this.getMarkersFromRect.bind(this))
        this.app.post('/deleteUser', this.deleteUser.bind(this));
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
        const r = await this.controller.register(req.body.username, req.body.password, req.body.email, req.body.birthdate);
        return res.send(JSON.stringify(r));; //ritorna il risultato della send se ha avuto errori o no??
    }

    async login(req, res) {
        const r = await this.controller.login(req.body.username, req.body.password);
        if (r.ok) {
            req.session.loggedin = true;
            req.session.user_id = r.data.id;
            req.session.username = r.data.username;
            req.session.email = r.data.email
            req.session.birthdate = r.data.birthdate;
            req.session.isAdmin = r.data.isAdmin;
            req.session.avatar = r.data.avatar;
            req.session.placeDetails = {}
            req.session.distanceDetails = {}
            //req.session.userType = 0, 1, 2, 3.  
            //Questa info ce l'ha il server quindi non ci sono problemi di sicurezza!
        }
        return res.send(JSON.stringify(r));
    }

    async view_roadmap(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/view_roadmap.html');
    }

    async getRoadmapData(req, res) { //era viewrm
        const r = await this.controller.getRoadmapData(req.query.id);

        if (req.session.loggedin) { //salva info per eventuale fork
            req.session.placeDetails = {}; //reset
            req.session.distanceDetails = {};
            //vanno popolati placeDetails & distanceDetails
            const stages = r.data.roadmap.stages;
            var stage;
            for (var i = 0; i < stages.length; i++) {
                stage = stages[i];
                req.session.placeDetails[stage.placeId] = [stage, stage.isExNovo]
                if (i > 0) {
                    req.session.distanceDetails[stages[i - 1].placeId + "|" + stage.placeId] = stage.route
                }

            }
            //console.log(req.session)


        }
        return res.send(JSON.stringify(r));
    }

    //inutile
    async getCommmentsReviewByUserRoad(req, res) {
        //console.log(req.query)
        const r = await this.controller.getCommmentsReviewByUserRoad(req.query.id_user, req.query.id_rm);
        return res.send(JSON.stringify(r));
    }

    async getPreferredFavouriteStatusByUserByRoadmap(req, res) {
        //console.log(req.query)
        const r = await this.controller.getPreferredFavouriteStatusByUserByRoadmap(req.query.user_id, req.query.roadmap_id);
        return res.send(JSON.stringify(r));
    }

    async getCommentiRecensioni(req, res) {
        const r = await this.controller.getCommentiRecensioni(req.query.id);
        return res.send(JSON.stringify(r));
    }

    async createCommento(req, res) {
        const r = await this.controller.createCommento(req.session.user_id, req.body.roadmap_id, req.body.messaggio);
        return res.send(JSON.stringify(r))

    }

    async updateCommento(req, res) {
        const r = await this.controller.updateCommento(req.session.user_id, req.body.idCommento, req.body.messaggio);
        return res.send(JSON.stringify(r))
    }

    async deleteCommento(req, res) {
        const r = await this.controller.deleteCommento(req.session.user_id, req.body.idCommento, req.session.isAdmin);
        return res.send(JSON.stringify(r))
    }

    async deleteRecensione(req, res) {
        const r = await this.controller.deleteRecensione(req.session.user_id, req.body.idRecensione, req.session.isAdmin);
        return res.send(JSON.stringify(r))
    }
    async createRecensione(req, res) {
        const r = await this.controller.createRecensione(req.session.user_id, req.body.roadmapId, req.body.opinione, req.body.valutazione);
        return res.send(JSON.stringify(r))
    }

    async updateRecensione(req, res) {
        const r = await this.controller.updateRecensione(req.session.user_id, req.body.idRecensione, req.body.opinione, req.body.valutazione);
        return res.send(JSON.stringify(r))
    }

    async setRoadmapAsFavourite(req, res) {
        const r = await this.controller.setRoadmapFavouriteState(req.session.user_id, req.body.roadmap_id, req.body.newStatus);
        return res.send(JSON.stringify(r))
    }

    async setRoadmapAsSeguita(req, res) {
        const r = await this.controller.setRoadmapCheckedState(req.session.user_id, req.body.roadmap_id, req.body.newStatus);
        return res.send(JSON.stringify(r))
    }

    async getMap(req, res) {
        const r = await this.controller.getMap();
        return res.send(r);
    }

    async deleteUser(req, res) {
        var r = { ok: false, error: -1, data: {} }
        if (req.session.isAdmin) {
            r = await this.controller.deleteUser(req.body.user_id);
        }
        return res.send(JSON.stringify(r))
    }


    async getSegnalazioni(req, res) {
        var r = { ok: false, error: -1, data: {} }
        if (req.session.isAdmin || true) { // || true da togliere a tutti! solo per testing!

            r = await this.controller.getSegnalazioni();

        }
        return res.send(JSON.stringify(r));
    }

    async processSegnalazioni(req, res) {
        var r = { ok: false, error: -1, data: {} }
        if (req.session.isAdmin || true) { // || true da togliere a tutti! solo per testing!
            r = await this.controller.processSegnalazioni(req.body);
        }
        return res.send(JSON.stringify(r));
    }

    async deleteStage(req, res) {
        var r = { ok: false, error: -1, data: {} }
        if (req.session.isAdmin) {
            r = await this.controller.deleteStage(req.body.stageId);
        }
        return res.send(JSON.stringify(r))
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

            req.body.stages = JSON.parse(req.body.stages);
            const r = await this.controller.createRoadmap(req.session.user_id, req.body, req.session.placeDetails, req.session.distanceDetails, req.files);
            //const 
            if (r.ok) {
                console.log("OK ROADMAP")
            }
            //qua si svuota tutto!
            req.session.placeDetails = {} //svuotamento session troppo piccola?
            req.session.distanceDetails = {}

            return res.send(JSON.stringify(r))
        }
        return res.send(JSON.stringify({ ok: false, error: -666 })) //USER IS NOT LOGGED IN!
    }

    async getExNovoStages(req, res) {
        const r = await this.controller.getExNovoStages();
        return res.send(r);
    }

    async getDataUser(req, res) { //getDataUser != isLogWho!
        const r = await this.controller.getDataUser(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async getUserStatus(req, res) { //getDataUser != isLogWho!
        const isLogged = req.session.user_id !== undefined && req.session.user_id > 0;
        const r = await this.controller.getUserStatus(req.session.user_id);
        r.data.logged = isLogged;
        r.data.isAdmin = req.session.isAdmin || 0;
        return res.send(JSON.stringify(r));

    }

    async getRoadmapCreate(req, res) {
        const r = await this.controller.getRoadmapCreate(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async getRoadmapSeguite(req, res) {
        const r = await this.controller.getRoadmapSeguite(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async getRoadmapPreferite(req, res) {
        const r = await this.controller.getRoadmapPreferite(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async deleteRoadmap(req, res) { //OR ADMIN
        //if roadmap è sua oppure è admin.bisogna passar enelal deleteroadmap anche user id per semplificare molto il lavoro
        const r = await this.controller.deleteRoadmap(req.query.id, req.session.user_id, req.session.isAdmin);
        return res.send(JSON.stringify(r));
    }

    async updateRoadmapSeguite(req, res) {
        const r = await this.controller.updateRoadmapSeguite(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async updateRoadmapPreferite(req, res) {
        const r = await this.controller.updateRoadmapPreferite(req.query.id, req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async getPlaceInfo(req, res) {
        if (req.session.loggedin || true) { // da mettere!
            const isExNovo = 0;
            const r = await this.controller.getPlaceInfo(req.query.placeId);
            if (req.session.placeDetails === undefined) {
                req.session.placeDetails = {}
            }
            if (r.ok) {
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
            if (r.ok) {
                req.session.distanceDetails[req.body.origin + "|" + req.body.destination] = r.data;
            }
            return res.send(JSON.stringify(r));
        }
    }

    async reportObject(req, res) {
        if (req.session.loggedin || true) { // da mettere!
            const r = await this.controller.reportObject(req.session.user_id, req.body.tipo, req.body.idOggetto, req.body.motivazione);
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

    async getAchievements(req, res) {
        const r = await this.controller.getAchievements(req.query.id);
        return res.send(JSON.stringify(r));
    }

    async getRoadmapAchievementsPopup(req, res) {
        const r = await this.controller.getRoadmapAchievementsPopup(req.session.user_id);
        return res.send(JSON.stringify(r));
    }

    async searchRoadmap(req, res) {
        const r = await this.controller.searchRoadmap(req.query.ricerca, req.body.time, req.body.distance);
        return res.send(JSON.stringify(r));
    }
  
    async searchUser(req, res) {
        const r = await this.controller.searchUser(req.query.username);
        return res.send(JSON.stringify(r));
    }

    async suggestedRoadmap(req, res) {
        const r = await this.controller.suggestedRoadmap(req.body.numberRoadmapToDisplay,req.body.rating);
        return res.send(JSON.stringify(r));
    }

    async getBestRoadmap(req, res) {
        const r = await this.controller.getBestRoadmap();
        return res.send(JSON.stringify(r));
    }

    async main_page(req, res) {
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
        if (req.session.loggedin | true) { //fatto in viewrm. va bene?
            if (req.query.roadmap_id !== undefined && req.query.roadmap_id > 0) {
                //if req.query.roadmap_id is not null then should add to session something if logged
            }
        }
        return res.sendFile(__dirname + '/static/newCreate.html');
    }

    async signup_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        //return res.sendFile(__dirname + '/static/Signup.html');
        return res.sendFile(__dirname + '/static/registrazione.html');
    }

    async profile_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        //qua bisogna checkare che se non si passa il parametro id deve capire da solo che è quello dentro session.
        return res.sendFile(__dirname + '/static/Profile.html');
    }
    async admin_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        //qua bisogna checkare che se non si passa il parametro id deve capire da solo che è quello dentro session.

        if (req.session.isAdmin) {
            return res.sendFile(__dirname + '/static/AdminPanel.html');
        } else {
            return res.sendFile(__dirname + '/static/error.html');
        }
    }
}

module.exports = HTTPinterface;