import mongoose from "mongoose";
import bcrypt from 'bcrypt'

// User model to store the data in database
const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
}, {timestamps: true})

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password)
}

const User= mongoose.model("User", UserSchema)

export default User;