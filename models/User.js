const { Schema, model, Types } = require('mongoose');

//required - обязательное поле, unique -уникальное
const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  links: [
    {
      type: Types.ObjectId,
      ref: 'Link',
    },
  ],
});

module.exports = model('User', schema);
