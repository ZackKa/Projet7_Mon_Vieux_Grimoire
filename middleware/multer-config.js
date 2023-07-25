const multer = require('multer');
//Dictionnaire de mime_types (type de fichier)
const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png'
};
//On enregistre storage sur le disque avec une destination et un filename
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'images'); //Null pour signifier qu'il n'y a pas d'erreur et le nom du dossier de destination
	},
	filename: (req, file, callback) => { //On explique a multer quel nom de fichier utiliser
		const name = file.originalname.split(' ').join('_');//On recupere le nom d'origine en changer les espaces avec des underscore
		const extension = MIME_TYPES[file.mimetype]; //On crée l'extension avec l'element du dictionnaire qui correspond au mime type du fichier envoyé par le front
		callback(null, name + Date.now() + '.' + extension);//On crée le fichier avec un time stamp pour qu'il soit unique
	}
});

module.exports = multer({storage: storage}).single('image');//On appel multer et on lui passe l'objet storage, et c'est un fichier image unique grâce a single