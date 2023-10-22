module.exports = (fn) => {
  // console.log('catchASsnc1');
  return (req, res, next) => {
    // fn(req, res, next).catch((err) => next(err));
    //console.log('catchASsnc2');

    fn(req, res, next).catch(next);
  };
};
