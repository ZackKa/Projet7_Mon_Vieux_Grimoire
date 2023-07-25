module.exports = (req, res, next) => {
    let emailType = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let emailCheck = emailType.test(req.body.email);
    if (emailCheck) {
        next();
    } else {
        return res.status(400).json({
            message: "Adresse email invalide",
        });
    }
};