import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  gradeLevel: String,
  contentType: { type: String, required: true }, // Changed from fileType
  fileUrl: { type: String, required: true },
  fileSize: Number,
  isPremium: Boolean,
  tags: [String],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);
export default Material;