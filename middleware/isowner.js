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
            res.status(500).json({ error });
        });
};