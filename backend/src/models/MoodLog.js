import mongoose from 'mongoose';

const MoodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date(), index: true },
  mood: { type: String, enum: ['Productive', 'Neutral', 'Exhausted'], required: true },
});

export default mongoose.model('MoodLog', MoodLogSchema);
