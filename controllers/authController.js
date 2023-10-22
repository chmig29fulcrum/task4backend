const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.refresh = catchAsync(async (req, res, next) => {
  console.log('1');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log('2');
  if (!token || token == 'loggedout') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  console.log('3');
  console.log(token);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('4');

  let query = User.findById(decoded.id);
  const currentUser = await query;
  console.log('5');
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }
  console.log('6');
  createSendToken(currentUser, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }
  if (currentUser.status == 'blocked') {
    return next(new AppError('Blocked User.', 403));
  }
  req.user = currentUser;
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  if (!newUser) {
    return next(new AppError('User signup failure, please contact admin', 400)); // strange
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  let query = User.findOne({ email }).select('+password +verified');
  const user = await query;

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  if (user.verified === false) {
    return next(new AppError('User is not verified', 402));
  }
  if (user.status === 'blocked') {
    return next(new AppError('User is Blocked', 403));
  }
  createSendToken(user, 200, res);
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, satusCode, res) => {
  console.log('createSendToken');
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(satusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
