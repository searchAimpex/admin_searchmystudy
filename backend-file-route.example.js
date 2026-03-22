/**
 * Backend fix for empty req.body with FormData
 *
 * FormData sends multipart/form-data. express.json() and express.urlencoded()
 * do NOT parse multipart – you MUST use multer so req.body and req.files get populated.
 *
 * Add this to your backend file route (e.g. routes/file.js or wherever /api/admin/file is):
 */

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + (file.originalname || "file")),
});

// Single file field "template" + all text fields go to req.body
const upload = multer({ storage }).single("template");

// POST /api/admin/file
router.post("/", upload, (req, res) => {
  // After multer runs, req.body has: name, type, SecondCountry, university
  // req.file has the uploaded template
  const { name, type, SecondCountry, university } = req.body;
  const templateFile = req.file;

  console.log("req.body:", req.body);   // name, type, SecondCountry, university
  console.log("req.file:", req.file);   // { fieldname, originalname, path, ... }

  // Save to DB: template path/URL, name, type, SecondCountry, university
  // ...
});
