const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // Incorrect email (comparison string comes from User.js)
  if (err.message === "Incorrect email") {
    errors.email = "Email is not registered.";
  }

  // Incorrect password (comparison string comes from User.js)
  if (err.message === "Incorrect password") {
    errors.password = "Incorrect password. Please try again.";
  }

  // Duplicate error code
  if (err.code === 11000) {
    errors.email = "That email is already registered.";
    return errors;
  }

  // Validation errors
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// 3 days in milliseconds
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  // Payload is assigned the id
  return jwt.sign({ id }, "sdev255 secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Asynchronous task, so need to use await
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    // Successful
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Login is the static method we created in User.js
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    // Successful
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    // Return errors caught in handleErrors
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  // Cannot delete cookie from app, but can assign it a blank value and expires in 1 millisecond
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
