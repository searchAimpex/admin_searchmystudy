/**
 * Backend Multer configuration – field names MUST match frontend FormData.
 * Frontend appends: formData.append("FrontAdhar", file), formData.append("name", "...").
 * "Unexpected field" = backend received a FILE field name not in .fields().
 * Fix: use .fields(FILE_FIELD_NAMES) below so these exact names are accepted.
 */

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // or your upload dir
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + (file.originalname || "file"));
  },
});

// Exact same names the frontend sends via formData.append(name, file)
const FILE_FIELD_NAMES = [
  { name: "FrontAdhar", maxCount: 1 },
  { name: "BackAdhar", maxCount: 1 },
  { name: "PanCard", maxCount: 1 },
  { name: "ProfilePhoto", maxCount: 1 },
  { name: "CounsellorCode", maxCount: 1 },
  { name: "OwnerPhoto", maxCount: 1 },
  { name: "OfficePhoto", maxCount: 1 },
  { name: "mou", maxCount: 1 },
  { name: "registration", maxCount: 1 },
  { name: "VisitOffice", maxCount: 1 },  // frontend sends "VisitOffice" (not VistOffice)
  { name: "CancelledCheck", maxCount: 1 },
  { name: "Logo", maxCount: 1 },
  { name: "accountedDetails", maxCount: 1 },
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).fields(FILE_FIELD_NAMES);

// In your route – use a FLAT array, not nested:
//   upload.fields([ { name: "FrontAdhar", maxCount: 1 }, ... ])   ✅
//   upload.fields([ [ { name: "FrontAdhar", ... }, ... ] ])      ❌ (extra [ ] causes "Unexpected field")
//
// app.post("/api/users", upload, (req, res) => {
//   const files = req.files;  // { FrontAdhar: [...], BackAdhar: [...], ... }
//   const body = req.body;    // name, email, role, ...
//   ...
// });

module.exports = { upload, FILE_FIELD_NAMES };
