const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
    console.log("authentification token",req.headers.authorization)
    //On récupere le token
    try {
        const token = req.headers.authorization.split(" ")[1]; //On divise en tableau la chaine de caractere autour de l'espace entre Bearer et le token
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);//On decode le token en lui passant le token et la clé secrete
        const userId = decodedToken.userId; //On recupere le userId du token decodé
        console.log("userId : ",userId);
        req.auth = { //On met le userId recuperé, dans la requete qui va etre transmis aux routes
            userId: userId,
        };
        next();
    }catch(error) {
        console.log("auth : ", error );
        res.status(401).json("Une erreur est survenue lors de la vérification du jeton");    
    }
};