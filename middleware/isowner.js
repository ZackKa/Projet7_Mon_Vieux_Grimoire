const Book = require("../models/Book");

module.exports = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if ((book.userId = req.auth.userId)) {
                next();
            } else {
                res.status(401).json({ message: "Non autorisé" });
            }
        })
        .catch((error) => {
            console.log("isowner : ", error );
            res.status(500).json("Une erreur est survenue lors de la vérification des droits");
        });
};