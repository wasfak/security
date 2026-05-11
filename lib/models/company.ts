import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface ICompany extends Document {
  companyName: string
  phoneNumber: string
  purchasePerson: string
  notes?: string
  createdAt: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    purchasePerson: {
      type: String,
      required: [true, 'Purchase person name is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

const Company: Model<ICompany> =
  mongoose.models.Company ??
  mongoose.model<ICompany>('Company', CompanySchema)

export default Company
