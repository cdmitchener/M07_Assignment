const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter an email."],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email."],
  },
  password: {
    type: String,
    required: [true, "Please enter a password."],
    minlength: [6, "Minimum password length is 6 characters."],
  },
});

// Hook: fire a function before doc saved to DB. Cannot use arrow fxn because we need to use keyword 'this'
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Static method to login user ("login" is the name we give it... so could be named whatever we want, like userSchema.statics.loggedin)
userSchema.statics.login = async function (email, password) {
  // Make sure email exists in DB
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    // If the email does exist, make sure the password matches with it
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect email");
};

// must be named the singular of our collection, which in this case our collection is named "users"
const User = mongoose.model("user", userSchema);

module.exports = User;
