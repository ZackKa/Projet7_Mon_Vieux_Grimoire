const sharp = require('sharp');
const fs = require('fs'); // Permets de manipuler les fichiers.

module.exports = (req, res, next) => {
	if (!req.file) {
		console.log("Pas d'image !");
		return next();
	}
	sharp(req.file.path) // Chemin du fichier.
	.metadata() // Permets de récupérer les données.
	.then((metadata) => {
		console.log("reqFile", metadata);
		if (metadata.width > 900) {
    		return sharp(req.file.path).resize({ width: 900 }).toBuffer(); // Gère l'image en mémoire.
    	} else {
    		return sharp(req.file.path).toBuffer();
    	}
    })
    .then((data) => {
		fs.writeFile(req.file.path, data, (error) => {
			if (error) {
				console.log(error);
				next(error);
			}
			next();
		});
	})
    .catch((error) => {
		next(error);
    });
};