const book = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 30,
  },
  author: {
    required: false,
    type: 'string',
    minLength: 1,
    maxLength: 30,
  },
};

module.exports = {
  book,
};
