import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    dueDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Completed', 'Overdue'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
