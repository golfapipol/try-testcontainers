const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
exports.CounterSchema = counterSchema;
