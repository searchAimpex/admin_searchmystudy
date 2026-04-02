/**
 * MBBS / country routes — multer must allow the same FILE field names the admin app sends.
 * CreateMbbsForm sends: bannerURL, flagURL, sectionUrl_0, sectionUrl_1, …
 *
 * After this middleware, merge uploaded paths into sections (do not store base64 in DB):
 *
 *   const sections = JSON.parse(req.body.sections || "[]");
 *   for (let i = 0; i < sections.length; i++) {
 *     const key = `sectionUrl_${i}`;
 *     const arr = req.files[key];
 *     if (arr && arr[0]) {
 *       sections[i].url = "upload/" + arr[0].filename; // match your diskStorage / public URL
 *     }
 *   }
 *   // then save `sections` to MongoDB, etc.
 */

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname || "img"}`
    );
  },
});

const MAX_SECTIONS = 30;

const countryFileFields = [
  { name: "bannerURL", maxCount: 1 },
  { name: "flagURL", maxCount: 1 },
  ...Array.from({ length: MAX_SECTIONS }, (_, i) => ({
    name: `sectionUrl_${i}`,
    maxCount: 1,
  })),
];

const uploadCountry = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
}).fields(countryFileFields);

module.exports = { uploadCountry, countryFileFields };
