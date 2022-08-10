const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
//const reqController = require('./reqController.js');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
var md5 = require('md5');

var connection;
try {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '#Asd123f4',
        database: 'sakila', //db di default di sql per prove
        //port: 3306 ?
    });
} catch (error) {
    console.log(error)
}

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

        //this.controller = new reqController()
        this.initServer();

        this.port = config.port;

        this.server.listen(process.env.PORT || this.port, () => {
            console.log(`HTTP auth Server started on port ${this.server.address().port} :)`);
        });
    }
    //1 ) popolare la tabella del db con cryptati (chiave nota)
    //2 ) login deve implementare una hash con una chiave nota

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
        this.app.get('/diego', this.diego.bind(this));
        this.app.use('/static', express.static('static'));
        this.app.use('/storage', express.static('storage'));

        //back end calls
        this.app.post('/register', this.register.bind(this));
        this.app.post('/login', this.login.bind(this));
        this.app.post('/auth', this.auth.bind(this)); //Auth
        this.app.post('/logout', this.logout.bind(this));
        this.app.post('/activate', this.activate.bind(this));
        
        // http://localhost:3000/home
        this.app.get('/home', function (req, res) {
            // If the user is loggedin
            if (req.session.loggedin) {
                // Output username
                console.log(req.session);
                res.send('Welcome back, ' + req.session.username + '!');
            } else 
            {
                // Not logged in
                res.send('Please login to view this page!');
            }
            res.end();
        });

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

    /*async register(req, res) {
        const r = await this.controller.register(req.body.userName, req.body.password, req.body.email, req.body.prk, req.body.puk);
        res.send(JSON.stringify(r));
    }*/

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
        // Capture the input fields
        
        //STEP DI DECODIFICA f(k) per evitare sniffing
        
        
        let username = req.body.username;
        let password = req.body.password;
        // Ensure the input fields exists and are not empty
        if (username && password) {
            console.log(username,password)
            password = md5(password);
            console.log(username,password)
            // Execute SQL query that'll select the account from the database based on the specified username and password
            connection.query('SELECT * FROM utente WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) throw error;
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user

                    req.session.loggedin = true;
                    req.session.username = username;
                    // Redirect to home page

                    
                    req.session.diego = true;
                    res.redirect('/home');
                } else {
                    res.send('Incorrect Username and/or Password!');
                }
                res.end();
            });
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
        //const r = await this.controller.auth(req.body.userName, req.body.password);
        //res.send(JSON.stringify(r));
    }

    async logout(req, res) {
        const r = await this.controller.logout(req.body.id, req.body.token);
        res.send(JSON.stringify(r));
    }

    async activate(req, res) {
        const r = await this.controller.activate(req.body.id);
        res.send(JSON.stringify(r));
    }

    async register(req, res) {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        let birthdate = req.body.birthdate;
        // Ensure the input fields exists and are not empty
        console.log(req.body);

        if (username && password && email && birthdate) {
            password = md5(password);
            // Execute SQL query that'll insert the account in the database
            connection.query('INSERT INTO utente (username, password, email, birthdate) VALUES (?, ?, ?, ?)', [username, password, email, birthdate], function (error, results, fields) {
                console.log(error);
                // If the account exists
                if (error) {
                    if (error.errno == 1062) { //Username o email sono già in uso
                        res.send('Username or email already in use');
                    }
                    else if (error.errno != 0) { //Errore generico
                        res.send('There was an error');
                    }
                }
                else {
                    res.send('OK');
                }
                res.end();
            });
        } else {
            res.send('Please, ensure the input fields are not empty');
            res.end();
        }
    }
}

module.exports = HTTPinterface;