import mongoose from 'mongoose';

const wellnessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date(), index: true },
  mood: { type: String, enum: ['Productive', 'Neutral', 'Exhausted'], required: true },
  focusHours: { type: Number, default: 0 }, // total focus hours logged for the day
  sleepHours: { type: Number, default: 0 }, // optional sleep tracking
  burnoutScore: { type: Number, min: 0, max: 100 }, // 0 = healthy, 100 = severe burnout risk
  notes: { type: String }
});

export default mongoose.model('Wellness', wellnessSchema);
