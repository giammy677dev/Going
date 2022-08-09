const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
//const RequestController = require('./requestController.js');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'going',
    database: 'sakila', //db di default di sql per prove
    //port: 3306 ?
});

const config = require('./config.js');
const { response } = require('express');
const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

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
        this.app.get('/auth', this.auth.bind(this)); //Auth
        this.app.post('/logout', this.logout.bind(this));
        this.app.post('/activate', this.activate.bind(this));
        this.app.get('/testdb', function (request, response){
        console.log(connection)
        connection.query('SELECT * FROM actor', function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                response.send(results);
            } else {
                response.send("error");
            }
            response.end();
        });
        //return response.sendFile(__dirname + '/static/Main_Page.html');
        });

        // http://localhost:3000/
        this.app.get('/', function (request, response) {
            // Render login template
            response.sendFile(path.join(__dirname + '/static/login.html'));
        });

        // http://localhost:3000/auth
        this.app.post('/auth', function (request, response) {
            // Capture the input fields
            let username = request.body.username;
            let password = request.body.password;
            // Ensure the input fields exists and are not empty
            if (username && password) {
                // Execute SQL query that'll select the account from the database based on the specified username and password
                connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
                    // If there is an issue with the query, output the error
                    if (error) throw error;
                    // If the account exists
                    if (results.length > 0) {
                        // Authenticate the user
                        request.session.loggedin = true;
                        request.session.username = username;
                        // Redirect to home page
                        response.redirect('/home');
                    } else {
                        response.send('Incorrect Username and/or Password!');
                    }
                    response.end();
                });
            } else {
                response.send('Please enter Username and Password!');
                response.end();
            }
        });

        // http://localhost:3000/home
        this.app.get('/home', function (request, response) {
            // If the user is loggedin
            if (request.session.loggedin) {
                // Output username
                response.send('Welcome back, ' + request.session.username + '!');
            } else {
                // Not logged in
                response.send('Please login to view this page!');
            }
            response.end();
        });

    }

    async main_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/main.html');
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

    async profile_page(req, res) {
        if (req.user) {
            console.log('user session is alive')
        }
        return res.sendFile(__dirname + '/static/Profile.html');
    }

    async register(req, res) {
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

    async auth(req, res) {
        const r = await this.controller.auth(req.body.userName, req.body.password);
        res.send(JSON.stringify(r));
    }

    async logout(req, res) {
        const r = await this.controller.logout(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async activate(req, res) {
        const r = await this.controller.activate(req.body.id);
        res.send(JSON.stringify(r));
    }
}

module.exports = HTTPinterface;