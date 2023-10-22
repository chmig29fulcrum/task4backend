const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //console.log('getAllusers');
  let query = User.find();
  const docs = await query;
  //console.log(docs);
  //const docs = await features.query.explain(); // .explain returns data analytics

  res.status(200).json({
    status: 'success',
    //  requestedAt: req.requestTime,
    results: docs.length,
    data: {
      data: docs,
    },
  });
});

exports.modifyUsers = async (req, res) => {
  console.log(req.body);
  const { userIds, action } = req.body;
  console.log(userIds);
  console.log(action);

  if (!userIds || !Array.isArray(userIds) || !action) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const userIdObjects = userIds.map(
      (userId) => new mongoose.Types.ObjectId(userId)
    );

    if (action === 'delete') {
      await User.deleteMany({ _id: { $in: userIdObjects } });
    }
    let updateQuery = {};
    switch (action) {
      case 'block':
        updateQuery = { $set: { status: 'blocked' } };
        break;
      case 'unblock':
        updateQuery = { $set: { status: 'active' } };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await User.updateMany({ _id: { $in: userIdObjects } }, updateQuery);

    return res.status(200).json({
      message: `Performed ${action} action on users with IDs: ${userIds.join(
        ', '
      )}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
