const express = require('express'); //On appel express pour crée le router
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); //Pour gérer les téléchargement de fichier
const bookCtrl = require('../controllers/book');
const sharp = require('../middleware/sharp'); //Traitement de la taille d'image
const isOwner = require('../middleware/isowner') //Verifie le propriétaire du livre

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatingBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.put('/:id', auth, isOwner, multer, sharp, bookCtrl.modifyBook);
router.delete('/:id', auth, isOwner, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.sendRate);


module.exports = router;