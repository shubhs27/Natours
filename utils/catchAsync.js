module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// catch async is being called which then calls fn but it should not be called & wait until express calls it (when someone hits the route). So, solution is to make catchAsync function return another function which is then going to be assigned to createTour and that function can later be called when necessary
