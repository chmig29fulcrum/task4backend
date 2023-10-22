const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

//идентификатор, именем, мылом, датой регистрации, датой последнего логина, статусом

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: [true, 'User must have a username'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  createdAt: { type: Date, default: Date.now() },
  lastLogin: { type: Date, default: Date.now() },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [1, 'Password must have more or equal then 1 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
