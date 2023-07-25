const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const path = require('path');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// On crée une application express
const app = express();

const db='mongodb+srv://' + process.env.BDD_LOGIN + ':'+ process.env.BDD_PASSWORD+'@' + process.env.BDD_URL +'/' + process.env.BDD_NAME + '?retryWrites=true&w=majority';

//On relie notre base de données
mongoose.connect(db,
	{ useNewUrlParser: true,
	useUnifiedTopology: true })
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch(() => console.log('Connexion à MongoDB échouée !'));
//Ajout des headers sur la réponse
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*"); //Tout le monde peut accéder à l'API
	res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");//On donne l'autorisation de certains "headers"
	res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE");//On donne l'autorisation de certains "methods"
	next();
});

app.use(express.json()); //Intercepte requête avec JSON et met le contenue sur l'objet requête dans req.body

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));//On recupere le repertoir où s'execute le serveur et y concatene le répertoire images

//On exporte notre app pour qu'elle soit accessible depuis nos autres fichiers, notamment le serveur node.
module.exports = app;