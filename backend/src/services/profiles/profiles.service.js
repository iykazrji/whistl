// Initializes the `profiles` service on path `/profiles`
const createService = require('feathers-mongoose');
const createModel = require('../../models/profiles.model');
const hooks = require('./profiles.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'profiles',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/profiles', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('profiles');

  service.hooks(hooks);
};
