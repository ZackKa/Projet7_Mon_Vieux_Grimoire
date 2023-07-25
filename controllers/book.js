const Book = require('../models/Book');

const fs = require('fs');

exports.createBook = (req, res, next) => {
    // console.log("createBook");
    // console.log(req.body);
    const bookObject = JSON.parse(req.body.book);//On parse l'objet requete
    delete bookObject._id; //On supprime l'id car generer automatiquement par la base de donnée.
    delete bookObject._userId;//On supprime le userId car on ne fait pas confiance au client. On utilise celui du token
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, //On récupere userId de la requete
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//On crée l'url d'image
    });

    book.save() //On enregistre le livre dans la base
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => {
    console.log("book - create  : ", error );
    res.status(500).json("Une erreur est survenue lors de la création d'un livre");
    });
};

exports.getOneBook = (req, res, next) => {
    // console.log("getOneBook");
    //On récupere le livre en fonction de son id
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            // console.log("recupe 1 objet", book);
            res.status(200).json(book);
        }
    ).catch(
        (error) => {
            // console.log("recupe 2 objet", error); 
            res.status(404).json({
            error: error
        });
        }
    );
};
  
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {//On verifie qu'il y'a un objet file
        ...JSON.parse(req.body.book), //ON recupere l'objet en parsant la chaine de caractere
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //On recrée l'url de l'image
    } : { ...req.body }; // L'opérateur spread recupere les champs de body de la requete
  
    delete bookObject._userId;

    Book.findOne({_id: req.params.id})
        .then((book) => {
                //On met à jour un livre
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})//On récupere l'element a mettre a jour et avec quel objet avec l'id de la requete
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};
  
exports.deleteBook = (req, res, next) => {
    //On verifie l'id du livre cliqué
    Book.findOne({ _id: req.params.id})
        .then(book => {
                const filename = book.imageUrl.split('/images/')[1];//On recupere le nom du fichier autour du repertoire image
                fs.unlink(`images/${filename}`, () => { //On supprime l'image grace à unlink
                    //On supprime un livre
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};
  
exports.getAllBooks = (req, res, next) => {
    // console.log("getAllBooks");
    //On récupere la liste des livres
    Book.find().then(
        (books) => {
            // console.log("console books",books);
            res.status(200).json(books);
            }
    )
    .catch(error => {
        // console.log("book -getAllBooks : ", error );
        res.status(500).json("Une erreur est survenue lors de la récupération des livres");
    });
};

exports.getBestRatingBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
        books.sort((a, b) => b.averageRating - a.averageRating); //On trie les livre par ordre décroissant
        const bestBooks = books.slice(0, 3);//Renvoie un tableau des 3 livres mieux notés
        res.status(200).json(bestBooks);
        })
        .catch((error) => res.status(400).json({ error }));
};

exports.sendRate = (req, res, next) => {
    // Envoyer la nouvelle note
    Book.updateOne({ _id: req.params.id }, { $push: { ratings: { userId: req.body.userId, grade: req.body.rating } } }) //On ajoute la note dans ratings
        .then(() => {
        // Mettre à jour la moyenne
        Book.findOne({ _id: req.params.id })
        .then((book) => {
            let totalNote = 0;
            let moyenne = 0;
            for (let i = 0; i < book.ratings.length; i++) {
            totalNote += book.ratings[i].grade;
            }
            moyenne = totalNote / book.ratings.length;
            Book.updateOne({ _id: req.params.id }, { $set: { averageRating: moyenne } }) //ON remplace la moyenne avec la nouvelle
            .then(() => {
            // afficher de nouveau le livre
            Book.findOne({ _id: req.params.id })
                .then((book) => {
                res.status(200).json(book);
                })
                .catch((error) => res.status(404).json({ error }));
            });
        });
        })
        .catch((error) => {
        res.status(400).json({ error });
        });
};