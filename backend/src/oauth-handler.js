module.exports = function (app) {
  return function (url) {
    const config = app.get('authentication');
    const options = {
      jwt: config.jwt,
      secret: config.secret
    };

    return (req, res, next) => {
      if (req.feathers && req.feathers.payload) {
        let user_data = { user: req.feathers.user }
        return app.service('login').create(user_data, user_data).then(response => {
          const jwt_token = response.jwt_token
          res.redirect(`${url}?token=${jwt_token}`);
        })
          .catch(error => {
            next(error);
          });
      }
    };
  };
};