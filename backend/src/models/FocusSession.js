import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    start: { type: Date, required: true },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('FocusSession', focusSessionSchema);
