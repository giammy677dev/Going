/*const host = 'going.mysql.database.azure.com';
const user = 'giammy677';
const password = 'Asdf1234';
const database = 'going';
const port = process.env.port || 3000;*/

const host = 'localhost';
const user = 'root';
const password = 'going';
const database = 'mydb';
const port = process.env.port || 3000;

const ca = 'DigiCertGlobalRootCA.crt.pem'
const GOOGLE_MAPS_BACKEND_API_KEY = 'AIzaSyDkhHdG46Po1AyvEnEsk8PALxscMRpEYCs'
const GOOGLE_MAPS_FRONTEND_API_KEY = 'AIzaSyBPAAQaGDsfG0K4lksFbcEetDuNw85mlH8'
const stagesFolder = 'stages';

module.exports.hostDB = host;
module.exports.userDB = user;
module.exports.passwordDB = password;
module.exports.database = database;
module.exports.ca = ca;
module.exports.stagesFolder = stagesFolder;

module.exports.GOOGLE_MAPS_BACKEND_API_KEY = GOOGLE_MAPS_BACKEND_API_KEY;
module.exports.GOOGLE_MAPS_FRONTEND_API_KEY = GOOGLE_MAPS_FRONTEND_API_KEY;

module.exports.port = port;