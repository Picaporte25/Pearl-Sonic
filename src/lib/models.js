import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Track Schema
const TrackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sunoId: {
    type: String,
  },
  title: {
    type: String,
    default: 'Untitled',
  },
  description: {
    type: String,
  },
  genre: {
    type: String,
  },
  mood: {
    type: String,
  },
  duration: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
  },
  audioUrl: {
    type: String,
  },
  coverUrl: {
    type: String,
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Track = mongoose.models.Track || mongoose.model('Track', TrackSchema);

// CreditTransaction Schema
const CreditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'usage', 'refund'],
    required: true,
  },
  stripePaymentIntentId: {
    type: String,
  },
  stripeCheckoutSessionId: {
    type: String,
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const CreditTransaction = mongoose.models.CreditTransaction || mongoose.model('CreditTransaction', CreditTransactionSchema);
