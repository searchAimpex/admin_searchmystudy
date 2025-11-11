import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

// Redux slices
import { updateStudyCourse } from "../slice/AbroadCourseSlice.js";
import { fetchAbroadUniversity } from "../slice/AbroadUniversitySlice.js";
import { fetchAbroadStudy } from "../slice/AbroadSlice.js";
import { fetchAbroadProvince } from "../slice/AbroadProvinceSlice.js";
import { createMbbsCourse } from "../slice/MbbsCourse.js";

// Custom editor
import TextEditor from "./TextEditor.jsx";

// Firebase imports for file upload
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { app } from "../firebase";
import { toast, ToastContainer } from "react-toastify";

const categories = [
  "Arts",
  "Accounts",
  "Finance",
  "Marketing",
  "Science",
  "Medical",
  "Computers",
  "Engineering",
  "Law",
  "Education",
  "Social Sciences",
  "Business Administration",
  "Psychology",
  "Economics",
  "Architecture",
  "Environmental Science",
  "Nursing",
  "Hospitality Management",
  "Media and Communication",
  "Information Technology",
  "Pharmacy",
  "Agriculture",
  "Design",
  "Public Health",
  "Mathematics",
  "Data Science",
  "Artificial Intelligence",
];

const level = [
  "High School",
  "UG Diploma/Cerificate/Associate Degree",
  "UG",
  "PG Diploma",
  "PG",
  "UG+PG(Accelerated)Degree",
  "PhD",
  "Foundation",
  "Short Term Program",
  "Pathway Program",
  "Twiming Program(UG)",
  "Twiming Program(PG)",
  "Online Programe/Distance Learning",
];

const mode = ["Yearly", "Complete", "Semester"];

const CreateAbroadCourse = ({ ele, handleClose, loadCourse }) => {
  const dispatch = useDispatch();
  const storage = getStorage(app);

  const [errors, setErrors] = useState({});
  const [university, setUniversity] = useState([]);
  const [country, setCountry] = useState([]);
  const [province, setProvince] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [broucherPreview, setBroucherPreview] = useState("");

  const [form, setForm] = useState({
    ProgramName: ele?.ProgramName || "",
    Country: ele?.University?.Country || "",
    University: ele?.University?._id || "",
    Province: ele?.Province?._id || "",
    WebsiteURL: ele?.WebsiteURL || "",
    Location: ele?.Location || "",
    Duration: ele?.Duration || "",
    broucherURL: ele?.broucherURL || "",
    Category: ele?.Category || "",
    Intake: ele?.Intake || [{ status: true, date: "", end_date: "" }],
    Scholarships: ele?.Scholarships ?? false,
    ProgramLevel: ele?.ProgramLevel || "",
    languageRequire:
      ele?.languageRequire || {
        english: false,
        motherTongue: false,
        no_any_preference: false,
      },
    Eligibility: ele?.Eligibility || "",

    // ✅ Updated Fees structure
    Fees: {
      mode: ele?.Fees?.mode || "",
      currency: ele?.Fees?.currency || "",
      breakdown: ele?.Fees?.breakdown?.length
        ? ele.Fees.breakdown.map((b) => ({
          label: b.label || "",
          amount: b.amount || "",
        }))
        : [{ label: "", amount: "" }],
      totalAmount: ele?.Fees?.totalAmount || "",
    },
    completeFees:{
      currency:ele?.completeFees?.currency || "",
      amount:ele?.completeFees?.amount || ""
    },
    LanguageRequirements: {
      PTE: {
        status: ele?.LanguageRequirements?.PTE?.status || false,
        description: ele?.LanguageRequirements?.PTE?.description || "",
        minRequirement: ele?.LanguageRequirements?.PTE?.minRequirement || "",
      },
      TOEFL: {
        status: ele?.LanguageRequirements?.TOEFL?.status || false,
        description: ele?.LanguageRequirements?.TOEFL?.description || "",
        minRequirement: ele?.LanguageRequirements?.TOEFL?.minRequirement || "",
      },
      IELTS: {
        status: ele?.LanguageRequirements?.IELTS?.status || false,
        description: ele?.LanguageRequirements?.IELTS?.description || "",
        minRequirement: ele?.LanguageRequirements?.IELTS?.minRequirement || "",
      },
      DET: {
        status: ele?.LanguageRequirements?.DET?.status || false,
        description: ele?.LanguageRequirements?.DET?.description || "",
        minRequirement: ele?.LanguageRequirements?.DET?.minRequirement || "",
      },
    },

    StandardizeRequirement: {
      SAT: {
        status: ele?.StandardizeRequirement?.SAT?.status || false,
        description: ele?.StandardizeRequirement?.SAT?.description || "",
        minRequirement: ele?.StandardizeRequirement?.SAT?.minRequirement || "",
      },
      ACT: {
        status: ele?.StandardizeRequirement?.ACT?.status || false,
        description: ele?.StandardizeRequirement?.ACT?.description || "",
        minRequirement: ele?.StandardizeRequirement?.ACT?.minRequirement || "",
      },
      GRE: {
        status: ele?.StandardizeRequirement?.GRE?.status || false,
        description: ele?.StandardizeRequirement?.GRE?.description || "",
        minRequirement: ele?.StandardizeRequirement?.GRE?.minRequirement || "",
      },
      GMAT: {
        status: ele?.StandardizeRequirement?.GMAT?.status || false,
        description: ele?.StandardizeRequirement?.GMAT?.description || "",
        minRequirement: ele?.StandardizeRequirement?.GMAT?.minRequirement || "",
      },
    },
  });


  /** ---------------------- HANDLERS ---------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (["english", "no_any_preference", "motherTongue"].includes(name)) {
        setForm((prev) => ({
          ...prev,
          languageRequire: { ...prev.languageRequire, [name]: checked },
        }));
      } else {
        setForm((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, Eligibility: value }));
    setErrors((prev) => ({ ...prev, Eligibility: "" }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      const fileName = `brochures/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setForm(prev => ({ ...prev, broucherURL: downloadURL }));
      setBroucherPreview(downloadURL);
      toast.success("Brochure uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload brochure");
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      Intake: prev.Intake.map((intake, i) =>
        i === idx ? { ...intake, [field]: value } : intake
      ),
    }));
  };

  const addIntake = () => {
    setForm((prev) => ({
      ...prev,
      Intake: [...prev.Intake, { status: true, date: "", end_date: "" }],
    }));
  };

  const removeIntake = (idx) => {
    setForm((prev) => ({
      ...prev,
      Intake: prev.Intake.filter((_, i) => i !== idx),
    }));
  };

  const handleNestedChange = (section, field, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [key]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.ProgramName || !form.University || !form.WebsiteURL || !form.Location) {
        toast.error("⚠️ Please fill required fields!");
        return;
      }

      const payload = {
        ...form,
        Province: form.Province && form.Province !== "" ? form.Province : null,
      };

      let res;
      if (ele && ele._id) {
        console.log(payload);

        res = await dispatch(updateStudyCourse({ id: ele._id, data: payload }));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("✅ Course updated!");
  setTimeout(() => {
            handleClose();
          }, 1000);
          loadCourse();
        } else {
          toast.error(
            res.payload?.message ||
            res.error?.message ||
            "Failed to update course"
          );
        }
      } else {
        // console.log(payload, "++++++++++++++++++++++++++++++");

        const res = await dispatch(createMbbsCourse(payload));

        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("✅ Course created!");
          loadCourse();
          setTimeout(() => {
            handleClose();
          }, 1000);
        } else {
          toast.error(
            res.payload?.message ||
            res.error?.message ||
            "Failed to create course"
          );
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong!");
    }
  };

  /** ---------------------- API LOADERS ---------------------- */
  const loadUniversity = async (countryId) => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadUniversity());
      if (res?.meta?.requestStatus === "fulfilled") {
        const filtered = res.payload?.filter(
          (u) => u.Country._id === countryId
        );
        setUniversity(filtered);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCountry = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadStudy());
      if (res?.meta?.requestStatus === "fulfilled") {
        setCountry(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProvince = async (id) => {
    setLoading(true);
    try {
      const res = await dispatch(fetchAbroadProvince());
      if (res?.meta?.requestStatus === "fulfilled") {
        const filtered = res.payload?.filter((u) => u.Country._id === id);
        setProvince(filtered);
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------- EFFECTS ---------------------- */
  useEffect(() => {
    loadCountry();
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          const codes = Object.keys(data.rates);
          setCurrencies(codes);
        }
      })
      .catch((err) => console.error("Error fetching currencies:", err));
  }, [dispatch]);

  // Update form when ele prop changes (for editing existing courses)
  useEffect(() => {
    if (ele && ele._id) {
      setForm({
        ProgramName: ele?.ProgramName || "",
        Country: ele?.University?.Country || "",
        University: ele?.University?._id || "",
        Province: ele?.Province?._id || "",
        WebsiteURL: ele?.WebsiteURL || "",
        Location: ele?.Location || "",
        Duration: ele?.Duration || "",
        broucherURL: ele?.broucherURL || "",
        Category: ele?.Category || "",
        Intake: ele?.Intake || [{ status: true, date: "", end_date: "" }],
        Scholarships: ele?.Scholarships ?? false,
        ProgramLevel: ele?.ProgramLevel || "",
        languageRequire: ele?.languageRequire || {
          english: false,
          motherTongue: false,
          no_any_preference: false,
        },
        Eligibility: ele?.Eligibility || "",
        Fees: {
          mode: ele?.Fees?.mode || "",
          currency: ele?.Fees?.currency || "",
          breakdown: ele?.Fees?.breakdown?.length
            ? ele.Fees.breakdown.map((b) => ({
                label: b.label || "",
                amount: b.amount || "",
              }))
            : [{ label: "", amount: "" }],
          totalAmount: ele?.Fees?.totalAmount || "",
        },
        completeFees: {
          currency: ele?.completeFees?.currency || "",
          amount: ele?.completeFees?.amount || ""
        },
        LanguageRequirements: {
          PTE: {
            status: ele?.LanguageRequirements?.PTE?.status || false,
            description: ele?.LanguageRequirements?.PTE?.description || "",
            minRequirement: ele?.LanguageRequirements?.PTE?.minRequirement || "",
          },
          TOEFL: {
            status: ele?.LanguageRequirements?.TOEFL?.status || false,
            description: ele?.LanguageRequirements?.TOEFL?.description || "",
            minRequirement: ele?.LanguageRequirements?.TOEFL?.minRequirement || "",
          },
          IELTS: {
            status: ele?.LanguageRequirements?.IELTS?.status || false,
            description: ele?.LanguageRequirements?.IELTS?.description || "",
            minRequirement: ele?.LanguageRequirements?.IELTS?.minRequirement || "",
          },
          DET: {
            status: ele?.LanguageRequirements?.DET?.status || false,
            description: ele?.LanguageRequirements?.DET?.description || "",
            minRequirement: ele?.LanguageRequirements?.DET?.minRequirement || "",
          },
        },
        StandardizeRequirement: {
          SAT: {
            status: ele?.StandardizeRequirement?.SAT?.status || false,
            description: ele?.StandardizeRequirement?.SAT?.description || "",
            minRequirement: ele?.StandardizeRequirement?.SAT?.minRequirement || "",
          },
          ACT: {
            status: ele?.StandardizeRequirement?.ACT?.status || false,
            description: ele?.StandardizeRequirement?.ACT?.description || "",
            minRequirement: ele?.StandardizeRequirement?.ACT?.minRequirement || "",
          },
          GRE: {
            status: ele?.StandardizeRequirement?.GRE?.status || false,
            description: ele?.StandardizeRequirement?.GRE?.description || "",
            minRequirement: ele?.StandardizeRequirement?.GRE?.minRequirement || "",
          },
          GMAT: {
            status: ele?.StandardizeRequirement?.GMAT?.status || false,
            description: ele?.StandardizeRequirement?.GMAT?.description || "",
            minRequirement: ele?.StandardizeRequirement?.GMAT?.minRequirement || "",
          },
        },
      });
      
      // Set brochure preview if exists
      if (ele?.broucherURL) {
        setBroucherPreview(ele.broucherURL);
      }
    }
  }, [ele]);

  useEffect(() => {
    if (form.Country) {
      loadUniversity(form.Country);
      loadProvince(form.Country);
    }
  }, [form.Country]);

  /** ---------------------- UI ---------------------- */
  return (
    <Modal show={true} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{ele?._id ? "Update Course" : "Add Course"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Program Name */}
          <Form.Group>
            <Form.Label>Program Name *</Form.Label>
            <Form.Control
              type="text"
              name="ProgramName"
              value={form.ProgramName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            {/* Country */}
            <Col>
              <Form.Group>
                <Form.Label>Country *</Form.Label>
                <Form.Select
                  name="Country"
                  value={form.Country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  {country.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Province */}
            <Col>
              <Form.Group>
                <Form.Label>Province</Form.Label>
                <Form.Select
                  name="Province"
                  value={form.Province}
                  onChange={handleChange}
                >
                  <option value="">Select Province</option>
                  {province.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* University */}
          <Form.Group>
            <Form.Label>University *</Form.Label>
            <Form.Select
              name="University"
              value={form.University}
              onChange={handleChange}
              required
            >
              <option value="">Select University</option>
              {university.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Website */}
          <Form.Group>
            <Form.Label>Website URL *</Form.Label>
            <Form.Control
              type="text"
              name="WebsiteURL"
              value={form.WebsiteURL}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Duration */}
          <Form.Group>
            <Form.Label>Duration</Form.Label>
            <Form.Control
              type="text"
              name="Duration"
              value={form.Duration}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Brochure */}
          <Form.Group>
            <Form.Label>Brochure File</Form.Label>
            <Form.Control
              type="file"
              name="broucherURL"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            {form.broucherURL && (
              <small className="text-muted">
                Brochure uploaded: {form.broucherURL.split('/').pop()}
              </small>
            )}
          </Form.Group>

          {/* Location */}
          <Form.Group>
            <Form.Label>Location *</Form.Label>
            <Form.Control
              type="text"
              name="Location"
              value={form.Location}
              onChange={handleChange}
              required
              placeholder="Enter location"
            />
          </Form.Group>

          {/* Category */}
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="Category"
              value={form.Category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Intake */}
          <Form.Group>
            <Form.Label>Intakes</Form.Label>
            {form.Intake.map((intake, idx) => (
              <Row key={idx} className="mb-2">
                <Col>
                  <Form.Control
                    type="text"
                    value={intake.date}
                    onChange={(e) =>
                      handleIntakeChange(idx, "date", e.target.value)
                    }
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="date"
                    value={intake.end_date}
                    onChange={(e) =>
                      handleIntakeChange(idx, "end_date", e.target.value)
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeIntake(idx)}
                  >
                    X
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="success" size="sm" onClick={addIntake}>
              + Add Intake
            </Button>
          </Form.Group>

          {/* Scholarships */}
          <Form.Check
            type="checkbox"
            label="Scholarships Available"
            name="Scholarships"
            checked={form.Scholarships}
            onChange={handleChange}
          />

          {/* Program Level */}
          <Form.Group>
            <Form.Label>Program Level</Form.Label>
            <Form.Select
              name="ProgramLevel"
              value={form.ProgramLevel}
              onChange={handleChange}
            >
              <option value="">Select Level</option>
              {level.map((lvl, idx) => (
                <option key={idx} value={lvl}>
                  {lvl}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Eligibility */}
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor content={form.Eligibility} setContent={handleContentChange} />
          </Form.Group>

          {/* Fees */}
          {/* Fees */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  // style={{width:"80px"}}
                  value={form.Fees.currency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      Fees: { ...form.Fees, currency: e.target.value },
                    })
                  }
                >
                  <option value="">Select</option>
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Mode</Form.Label>
                <Form.Select
                  //  style={{width:"120px"}}
                  value={form.Fees.mode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      Fees: {
                        ...form.Fees,
                        mode: e.target.value,
                        breakdown: [{ label: "", amount: "" }], // reset when switching
                        totalAmount: "",
                      },
                    })
                  }
                >
                  <option value="" disabled>Select</option>
                  <option value="semester">Semester</option>
                  <option value="year">Year</option>
                  {/* <option value="total">Total</option> */}
                </Form.Select >
              </Form.Group>
            </Col>
          </Row>

          {/* Show dynamic breakdown if mode = semester/year */}
          {(form.Fees.mode === "semester" || form.Fees.mode === "year") && (
            <>
              <Form.Label className="mt-3">
                {form.Fees.mode === "semester"
                  ? "Semester-wise Fee "
                  : "Year-wise Fee "}
              </Form.Label>

              {form.Fees.breakdown.map((b, i) => (
                <Row key={i} className="mb-2">
                  <Col>
                    <Form.Control
                      //  style={{width:"130px"}}
                      type="text"
                      placeholder={
                        form.Fees.mode === "semester"
                          ? `Semester ${i + 1}`
                          : `Year ${i + 1}`
                      }
                      value={b.label}
                      onChange={(e) => {
                        const updated = [...form.Fees.breakdown];
                        updated[i].label = e.target.value;
                        setForm({
                          ...form,
                          Fees: { ...form.Fees, breakdown: updated },
                        });
                      }}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      // style={{width:"130px"}}
                      type="number"
                      placeholder="Amount"
                      value={b.amount}
                      onChange={(e) => {
                        const updated = [...form.Fees.breakdown];
                        updated[i].amount = e.target.value;
                        setForm({
                          ...form,
                          Fees: { ...form.Fees, breakdown: updated },
                        });
                      }}
                    />
                  </Col>
                  <Col >
                    <Button
                      variant="danger"
                      onClick={() => {
                        const updated = form.Fees.breakdown.filter(
                          (_, idx) => idx !== i
                        );
                        setForm({
                          ...form,
                          Fees: { ...form.Fees, breakdown: updated },
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}

              <Button
                variant="primary"
                onClick={() =>
                  setForm({
                    ...form,
                    Fees: {
                      ...form.Fees,
                      breakdown: [
                        ...form.Fees.breakdown,
                        {
                          label:
                            form.Fees.mode === "semester"
                              ? `Semester ${form.Fees.breakdown.length + 1}`
                              : `Year ${form.Fees.breakdown.length + 1}`,
                          amount: "",
                        },
                      ],
                    },
                  })
                }
              >
                +  {form.Fees.mode === "semester" ? "Semester" : "Year"}
              </Button>
            </>
          )}

          {/* Show totalAmount only if mode = total */}
          {form.Fees.mode === "total" && (
            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.Fees.totalAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        Fees: { ...form.Fees, totalAmount: e.target.value },
                      })
                    }
                    placeholder="Enter total amount"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Complete Fees Section */}
          <div className="mt-4">
            {/* <h6 className="fw-bold mb-3" style={{ color: '#007bff' }}>Complete Program Fees</h6> */}
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    value={form.completeFees.currency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        completeFees: { ...form.completeFees, currency: e.target.value },
                      })
                    }
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Complete Fee Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.completeFees.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        completeFees: { ...form.completeFees, amount: e.target.value },
                      })
                    }
                    placeholder="Enter complete fee amount"
                  />
                </Form.Group>
              </Col>
            </Row>
            
         
          </div>


          {/* Language Requirements */}
          <p className="mt-3">Language Requirements</p>
          {["PTE", "TOEFL", "IELTS", "DET"].map((test) => (
            <Row key={test} className="align-items-center mb-3">
              {/* Checkbox */}
              <Col xs={12} md={2}>
                <Form.Check
                  type="checkbox"
                  label={test}
                  checked={form.LanguageRequirements[test].status}
                  onChange={(e) =>
                    handleNestedChange(
                      "LanguageRequirements",
                      test,
                      "status",
                      e.target.checked
                    )
                  }
                />
              </Col>

              {/* Description */}
              <Col xs={12} md={5}>
                <Form.Control
                  placeholder="Description"
                  value={form.LanguageRequirements[test].description}
                  onChange={(e) =>
                    handleNestedChange(
                      "LanguageRequirements",
                      test,
                      "description",
                      e.target.value
                    )
                  }
                />
              </Col>

              {/* Min Requirement */}
              <Col xs={12} md={5}>
                <Form.Control
                  placeholder="Min Requirement"
                  value={form.LanguageRequirements[test].minRequirement}
                  onChange={(e) =>
                    handleNestedChange(
                      "LanguageRequirements",
                      test,
                      "minRequirement",
                      e.target.value
                    )
                  }
                />
              </Col>
            </Row>
          ))}


          {/* Standardized Requirements */}
          <p className="mt-3">Standardized Requirements</p>
          {["SAT", "ACT", "GRE", "GMAT"].map((test) => (
            <Row
              key={test}
              className="align-items-center mb-2 g-2"
              style={{ borderBottom: "1px solid #eaeaea", paddingBottom: "10px" }}
            >
              {/* Checkbox */}
              <Col xs={12} md={2}>
                <Form.Check
                  type="checkbox"
                  label={test}
                  checked={form.StandardizeRequirement[test].status}
                  onChange={(e) =>
                    handleNestedChange(
                      "StandardizeRequirement",
                      test,
                      "status",
                      e.target.checked
                    )
                  }
                />
              </Col>

              {/* Description */}
              <Col xs={12} md={5}>
                <Form.Control
                  size="sm"
                  placeholder="Description"
                  value={form.StandardizeRequirement[test].description}
                  onChange={(e) =>
                    handleNestedChange(
                      "StandardizeRequirement",
                      test,
                      "description",
                      e.target.value
                    )
                  }
                />
              </Col>

              {/* Min Requirement */}
              <Col xs={12} md={5}>
                <Form.Control
                  size="sm"
                  placeholder="Min Requirement"
                  value={form.StandardizeRequirement[test].minRequirement}
                  onChange={(e) =>
                    handleNestedChange(
                      "StandardizeRequirement",
                      test,
                      "minRequirement",
                      e.target.value
                    )
                  }
                />
              </Col>
            </Row>
          ))}

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {/* <Button 
          variant="info" 
          onClick={() => {
            console.log("🐛 DEBUG - Current Form State:", form);
            console.log("🐛 DEBUG - Complete Fees:", form.completeFees);
            console.log("🐛 DEBUG - Regular Fees:", form.Fees);
            console.log("🐛 DEBUG - Element Data:", ele);
            console.log("🐛 DEBUG - Form Validation:", {
              ProgramName: !!form.ProgramName,
              University: !!form.University,
              WebsiteURL: !!form.WebsiteURL,
              Location: !!form.Location
            });
            toast.info("Check console for debug information");
          }}
          className="me-2"
        >
          🐛 Debug
        </Button> */}
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : ele?._id ? "Update Course" : "Create Course"}
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default CreateAbroadCourse;