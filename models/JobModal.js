const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Devops",
        "Java",
        "Python",
        "JavaScript",
        "Data Science",
        "UI/UX",
        "Testing",
        "Product Management",
        "HR",
        "Sales",
        "Marketing"
      ],
      required: true,
    },

    experience: {
      type: String,
      required: false
    },

    location: {
      type: String,   // ✅ NEW FIELD
      required: false // optional
    },

    link: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);