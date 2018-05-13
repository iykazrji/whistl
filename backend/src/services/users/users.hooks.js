const { authenticate } = require('@feathersjs/authentication').hooks;

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

const authenticateAfterUserCreate = () => {
  // This Hook is used mainly on Local Auth...
  return context => {
    let strategy = context.data.strategy;
    let user_params = {
      user: context.result 
    };
    switch (strategy) {
      case 'local':
        // Populate the user_data to authenticate...
        let user_data = {
          email: context.data.email,
          password: context.data.password,
          strategy: 'local'
        }
        // Create a new authentication attempt. If successful we should get a JWT token the user can 
        // Make use of subsequently...
        return context.app.service('login').create(user_data, user_params)
          .then(
            auth_response => {
              context.result.jwt_token = auth_response.jwt_token
            }
          )
          .catch(error => {
            console.log(error)
          })   
    }
    return context;
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [hashPassword()],
    update: [hashPassword(), authenticate('jwt')],
    patch: [hashPassword(), authenticate('jwt')],
    remove: [authenticate('jwt')]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [authenticateAfterUserCreate()],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
