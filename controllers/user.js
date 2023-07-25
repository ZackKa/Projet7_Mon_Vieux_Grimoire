const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt //On hash le mot de passe.
        .hash(req.body.password, 10) //On exécute l'algorithme de hashage 10 fois.
        .then(hash => {
            const user = new User({ //On crée un nouvel utilisateur.
                email: req.body.email,
                password: hash
            });
        user
            .save() //On sauvegarde l'email et le mot de passe dans la base de données.
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => {
                console.log("user - signup (catch1) : ", error );
                res.status(400).json("Une erreur est survenue lors de la création de l'utilisateur");
            });
        })
        .catch(error => {
            console.log("user - signup (catch2) : ", error );
            res.status(500).json("Une erreur est survenue lors de la création de l'utilisateur");
        });

};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => { //On vérifie l'existence de l'utilisateur.
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }//On compare ce que l'utilisateur envoie avec ce qui est en base de données.
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({ //Objet contenant info nécessaire à l'authentification des requêtes.
                        userId: user._id,
                        //La fonction sign prend le userID, la clé secrète d'encodage et l'expiration du token.
                        token: jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
                          expiresIn: "24h",
                        }),
                    });
                })
                .catch(error => {
                    console.log("user - login (catch1) : ", error );
                    res.status(500).json("Une erreur est survenue lors de la connexion de l'utilisateur");
                });
        })
        .catch(error => {
            console.log("user - login (catch2) : ", error );
            res.status(500).json("Une erreur est survenue lors de la connexion de l'utilisateur");
        });

};