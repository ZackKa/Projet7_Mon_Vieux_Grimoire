const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); //On ajoute le validateur comme plugin au schéma

module.exports = mongoose.model("User", userSchema);