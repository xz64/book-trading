const userProfile = {
  fullname: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 30,
  },
  city: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 30,
  },
  state: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 2,
  },
};

module.exports = {
  userProfile,
};
