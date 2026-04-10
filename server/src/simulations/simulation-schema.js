import mongoose from 'mongoose'

const { Schema } = mongoose

const simulationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  initialCapital: {
    type: Number,
    required: true,
    min: 0,
  },
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0,
  },
  annualRate: {
    type: Number,
    required: true,
  },
  durationYears: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
  },
  // Résultats calculés côté serveur
  finalCapital: {
    type: Number,
    required: true,
  },
  totalContributions: {
    type: Number,
    required: true,
  },
  totalInterest: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.model('Simulation', simulationSchema)
