const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestController = require('./requestController.js');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
const md5 = require('md5');

/*var connection;
try {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'going',
        database: 'sakila', //db di default di sql per prove
        //port: 3306 ?
    });
} catch (error) {
    console.log(error)
}*/

const config = require('./config.js');
const { res } = require('express');
const { rmSync } = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

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
        this.app.get('/', this.main_page.bind(this)); //MainPage
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
        this.app.post('/auth', this.auth.bind(this)); //Authentication
        this.app.post('/logout', this.logout.bind(this));
        //this.app.post('/activate', this.activate.bind(this));
        
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
        if (r[0] == true) {
            //Redirect to home page
            res.redirect('/home');
        }
        else {
            res.redirect('/login');
        }
    }

    async auth(req, res) {
        const r = await this.controller.auth(req.body.username, req.body.password);
        console.log(r);
        if (r[0] == true) {
            req.session.loggedin = true;
            req.session.username = r[1];

            // Redirect to home page
            res.redirect('/home');
        }
        else {
            res.redirect('/login');
        }
    }

    async main_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/main.html');
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

    async logout(req, res) {
        const r = await this.controller.logout(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    /*async activate(req, res) {
        const r = await this.controller.activate(req.body.id);
        res.send(JSON.stringify(r));
    }*/
}

module.exports = HTTPinterface;