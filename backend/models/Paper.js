import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Paper title is required'],
    trim: true,
  },
  firstAuthor: {
    type: String,
    required: [true, 'First author name is required'],
    trim: true,
  },
  researchDomain: {
    type: String,
    required: [true, 'Research domain is required'],
    enum: [
      'Computer Science',
      'Biology',
      'Physics',
      'Chemistry',
      'Mathematics',
      'Social Sciences',
    ],
  },
  readingStage: {
    type: String,
    required: [true, 'Reading stage is required'],
    enum: [
      'Abstract Read',
      'Introduction Done',
      'Methodology Done',
      'Results Analyzed',
      'Fully Read',
      'Notes Completed',
    ],
  },
  citationCount: {
    type: Number,
    required: [true, 'Citation count is required'],
    min: 0,
  },
  impactScore: {
    type: String,
    required: [true, 'Impact score is required'],
    enum: ['High Impact', 'Medium Impact', 'Low Impact', 'Unknown'],
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexing for efficient querying
paperSchema.index({ user: 1, dateAdded: -1 });
paperSchema.index({ user: 1, researchDomain: 1 });
paperSchema.index({ user: 1, readingStage: 1 });

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;
