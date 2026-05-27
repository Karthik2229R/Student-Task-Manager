import mongoose from '../config/mongooseMock.js';

const MoodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date(), index: true },
  mood: { type: String, enum: ['Productive', 'Neutral', 'Exhausted'], required: true },
});

export default mongoose.model('MoodLog', MoodLogSchema);
