const { mongoose } = require('../../../config/mongo');

const statEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['user_registered', 'order_placed'], index: true },
    userId: { type: String, required: true },
    amount: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

statEventSchema.index({ type: 1, createdAt: 1 });

module.exports = mongoose.model('StatEvent', statEventSchema);