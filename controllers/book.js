const Book = require('../models/Book');

const fs = require('fs');

exports.createBook = (req, res, next) => {
    // console.log("createBook");
    // console.log(req.body);
    const bookObject = JSON.parse(req.body.book);//On parse l'objet requête.
    delete bookObject._id; //On supprime l'id car il est généré automatiquement par la base de donnée.
    delete bookObject._userId;//On supprime le userId car on ne fait pas confiance au client. On utilise celui du token.
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, //On récupère userId de la requête.
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//On crée l'url d'image.
    });

    book.save() //On enregistre le livre dans la base.
    .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
    .catch(error => {
    console.log("book - createBook  : ", error );
    res.status(500).json("Une erreur est survenue lors de la création d'un livre");
    });
};

exports.getOneBook = (req, res, next) => {
    // console.log("getOneBook");
    //On récupère le livre en fonction de son id.
    Book.findOne({
        _id: req.params.id
    }).then(
        (book) => {
            // console.log("recupe 1 objet", book);
            res.status(200).json(book);
        }
    ).catch((error) => {
        console.log('getOneBook :',error); 
        res.status(401).json( "Un problème est survenue lors de la mise à jour des livres" )});
};
  
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {//On vérifie qu'il y a un objet file.
        ...JSON.parse(req.body.book), //On récupère l'objet en parsant la chaine de caractère.
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //On recrée l'url de l'image.
    } : { ...req.body }; // L'opérateur spread récupère les champs de body de la requête.
  
    delete bookObject._userId;

    Book.findOne({_id: req.params.id})
        .then((book) => {
                //On met à jour un livre.
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})//On récupère l'élément à mettre à jour ainsi que l'objet, avec l'id de la requête.
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch((error) => {
                    console.log('modifyBook : catch 1 :',error); 
                    res.status(401).json( "Un problème est survenue lors de la suppression" )});
        })
        .catch((error) => {
            console.log('modifyBook : catch 2 :',error);
            res.status(400).json("Un problème est survenue lors de la modification");
        });
};
  
exports.deleteBook = (req, res, next) => {
    //On vérifie l'id du livre cliqué.
    Book.findOne({ _id: req.params.id})
        .then(book => {
                const filename = book.imageUrl.split('/images/')[1];//On récupère le nom du fichier autour du répertoire image.
                fs.unlink(`images/${filename}`, () => { //On supprime l'image grace à unlink.
                    //On supprime un livre.
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch((error) => {
                            console.log('deleteBook : catch 1 :',error); 
                            res.status(401).json( "Un problème est survenue lors de la suppression" )});
                });
        })
        .catch((error) => {
            console.log('deleteBook : catch 2 :',error); 
            res.status(500).json( "Un problème est survenue lors de la suppression" )});
};
  
exports.getAllBooks = (req, res, next) => {
    // console.log("getAllBooks");
    //On récupère la liste des livres.
    Book.find().then(
        (books) => {
            console.log("console books getAllBooks",books);
            res.status(200).json(books);
            }
    )
    .catch(error => {
        console.log("book -getAllBooks : ", error );
        res.status(500).json("Une erreur est survenue lors de la récupération des livres");
    });
};

exports.getBestRatingBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
        books.sort((a, b) => b.averageRating - a.averageRating); //On trie les livre par ordre décroissant.
        const bestBooks = books.slice(0, 3);//Renvoie un tableau des 3 livres mieux notés.
        res.status(200).json(bestBooks);
        })
        .catch((error) => {
            console.log('getBestRatingBooks : catch 1 :',error); 
            res.status(400).json( "Un problème est survenue lors de la mise à jour des meilleurs livres" )});
};

exports.sendRate = (req, res, next) => {
    // Envoyer la nouvelle note.
    Book.updateOne({ _id: req.params.id }, { $push: { ratings: { userId: req.body.userId, grade: req.body.rating } } }) //On ajoute la note dans ratings
        .then(() => {
        // Mettre à jour la moyenne.
        Book.findOne({ _id: req.params.id })
        .then((book) => {
            let totalNote = 0;
            let moyenne = 0;
            for (let i = 0; i < book.ratings.length; i++) {
                totalNote += book.ratings[i].grade;
            }
            moyenne = totalNote / book.ratings.length;
            Book.updateOne({ _id: req.params.id }, { $set: { averageRating: moyenne } }) //On remplace la moyenne avec la nouvelle.
            .then(() => {
            // Afficher de nouveau le livre.
            Book.findOne({ _id: req.params.id })
                .then((book) => {
                res.status(200).json(book);
                })
                .catch((error) => {
                    console.log('sendRate : catch 1 :',error); 
                    res.status(404).json( "Un problème est survenue lors de la mise à jour de la note" )});
            });
        });
        })
        .catch((error) => {
            console.log('sendRate : catch 2 :',error); 
            res.status(400).json( "Un problème est survenue lors de la mise à jour de la note" )
        });

};