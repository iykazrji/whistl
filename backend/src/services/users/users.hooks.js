const { authenticate } = require('@feathersjs/authentication').hooks;

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

const authenticateAfterUserCreate = () => {
  return context => {
    let strategy = context.data.strategy;
    let user_params = context.result;
    switch (strategy) {
      case 'local':
        // Populate the user_data to authenticate...
        let user_data = {
          email: context.data.email,
          password: context.data.password,
          strategy: 'local'
        }

        // Create a new authentication attempt. If successful we should get and accessToken
        return context.app.service('login').create(user_data, user_params)
          .then(
            auth_response => {
              context.result.accessToken = auth_response.accessToken
            }
          )
          .catch(error => {
            console.log(error)
          })
          
    }
    return context;
  }
}

const createUserProfile = () => {
  return context => {
    console.log(context.params)
    let strategy = context.data.strategy;
    if (strategy === "google") {
      // Create a new user profile with data from google auth
      console.log(context)
      // user_data = context.data.payload.user_profile
      // return context.app.service('profiles').create(user_profile)
      // .then(
      //   response => {
      //     console.log(response)
      //   }
      // )
      // .catch(
      //   error => {
      //     console.log(error)
      //   }
      // )
    }
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
    create: [authenticateAfterUserCreate(), createUserProfile()],
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
