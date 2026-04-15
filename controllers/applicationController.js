const Application = require("../models/ApplicationModel");
const { uploadFile } = require("../utils/cloudinary");
const nodemailer = require("nodemailer");

// ✅ Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ CREATE APPLICATION
exports.createApplication = async (req, res) => {
  try {
    const { full_name, email, mobile, message, jobId } = req.body;

    let pdfUrl = "";
    let pdfPublicId = "";

    if (!full_name || !email || !mobile || !jobId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided."
      });
    }

    // ✅ Upload Resume
    if (req.file) {
      const result = await uploadFile(req.file.buffer, "resumes");

      pdfUrl = result.url;
      pdfPublicId = result.public_id;
    } else {
      return res.status(400).json({
        success: false,
        message: "Resume PDF file is required."
      });
    }

    // ✅ Save to DB
    const newApplication = new Application({
      full_name,
      email,
      mobile,
      message,
      pdfUrl,
      pdfPublicId,
      jobId,
    });

    const savedApplication = await newApplication.save();

    // =========================
    // ✅ SEND EMAIL
    // =========================
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: "akankshachaudhari736@gmail.com",
      subject: "🚀 New Job Application Received",
      html: `
        <h2>New Application Received</h2>
        <p><b>Name:</b> ${full_name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Message:</b> ${message || "N/A"}</p>
        <p><b>Resume:</b> <a href="${pdfUrl}" target="_blank">View Resume</a></p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted & email sent",
      data: savedApplication,
    });

  } catch (error) {
    console.error("Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Application failed",
      error: error.message,
    });
  }
};
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate("jobId");
    console.log(` Retrieved ${applications.length} applications.`);
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(" Error fetching applications:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" Fetching application with ID:", id);

    const application = await Application.findById(id).populate("jobId");

    if (!application) {
      console.warn(" Application not found for ID:", id);
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error(" Error fetching application by ID:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" Deleting application with ID:", id);

    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      console.warn(" Application not found for deletion:", id);
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    console.log(" Application deleted successfully:", deletedApplication._id);
    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error(" Error deleting application:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
