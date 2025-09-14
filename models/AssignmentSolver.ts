import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssignmentSolver extends Document {
  userId: mongoose.Types.ObjectId;
  fileId: string;
  originalName: string;
  status: 'pending' | 'solved';
  solvedFileId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSolverSchema = new Schema<IAssignmentSolver>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  fileId: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'solved'],
    default: 'pending'
  },
  solvedFileId: {
    type: Schema.Types.ObjectId,
    required: false
  }
}, {
  timestamps: true
});

const AssignmentSolver: Model<IAssignmentSolver> =
  mongoose.models.AssignmentSolver ||
  mongoose.model<IAssignmentSolver>('AssignmentSolver', AssignmentSolverSchema);

export default AssignmentSolver;