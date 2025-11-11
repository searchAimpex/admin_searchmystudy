import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { fetchMbbsUniversity } from "../slice/mbbsUniversity.js";
import { fetchMbbsStudy } from "../slice/MbbsSlice.js";
import {
  createMbbsCourse,
  updateMbbsCourse,
} from "../slice/MbbsCourse.js";
import TextEditor from "./TextEditor.jsx";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { app } from "../firebase";

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

const CreateMbbsCourse = ({ ele, handleClose, loadCourse }) => {
  const dispatch = useDispatch();
  const storage = getStorage(app);
  const { studyMbbs } = useSelector((state) => state.mbbsStudy);
  const { mbbsUniversity } = useSelector((state) => state.mbbsUniversity);

  const [broucherPreview, setBroucherPreview] = useState("");
  const [university, setUniversity] = useState();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          const codes = Object.keys(data.rates);
          setCurrencies(codes);
        }
      })
      .catch((err) => console.error("Error fetching currencies:", err));
  }, []);


  const [form, setForm] = useState({
    ProgramName: ele?.ProgramName || "",
    Country: ele?.University?.Country || "",
    University: ele?.University?._id || "",
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
        : [{ label: "", amount: "" }]
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

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `provinces/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file && name === "broucherURL") {
        const previewURL = URL.createObjectURL(file);
        setBroucherPreview(previewURL);
        const imageURL = await uploadImage(file);
        setForm((prev) => ({ ...prev, broucherURL: imageURL }));
      }
      return;
    }

    if (["english", "motherTongue", "no_any_preference"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        languageRequire: { ...prev.languageRequire, [name]: checked },
      }));
      return;
    }

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, Eligibility: value }));
  };

  const handleIntakeChange = (idx, field, value) => {
    const newIntakes = [...form.Intake];
    newIntakes[idx][field] = value;
    setForm({ ...form, Intake: newIntakes });
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

  const handleSubmit = async () => {
    try {
      if (!form.ProgramName || !form.University || !form.WebsiteURL) {
        toast.error("⚠️ Please fill required fields!");
        return;
      }

      if (ele && ele._id) {
        const res = await dispatch(updateMbbsCourse({ id: ele._id, data: form }));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Updated Successfully!")
          loadCourse();
            setTimeout(() => {
            handleClose();
          }, 1000);
        } else {
          console.log(res)
          toast.error("Network Issue!")
        }
      } else {
        console.log(form, "-------------------------------");

        const res = await dispatch(createMbbsCourse(form));
        if (createMbbsCourse.fulfilled.match(res)) {
          // toast.success("✅ Course created!");
          loadCourse();
          setTimeout(() => {
            handleClose()
          }, 1000);
        } else {
          toast.error(
            res.payload?.message ||
            res.error?.message ||
            "Failed to create course"
          );
        }
      }
      // handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  const loadUniversity = async (selectedCountries) => {
    setLoading(true);
    try {
      const res = await dispatch(fetchMbbsUniversity());
      const filtered = (res.payload || []).filter(
        (u) => u.Country._id === selectedCountries
      );
      setUniversity(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = async () => {
      await dispatch(fetchMbbsStudy());
      await dispatch(fetchMbbsUniversity());
    };
    data();
  }, [dispatch]);

  return (
    <Modal show={true} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{ele?._id ? "Update Course" : "Add Course"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Program Name */}
          <Form.Group>
            <Form.Label>Program Name</Form.Label>
            <Form.Control
              type="text"
              name="ProgramName"
              value={form.ProgramName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Country */}
          <Form.Group className="mt-3">
            <Form.Label>Country</Form.Label>
            <Form.Select
              name="Country"
              value={form.Country}
              onChange={(e) => {
                handleChange(e);
                loadUniversity(e.target.value);
              }}
              required
            >
              <option value="">Select Country</option>
              {studyMbbs?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* University */}
          <Form.Group className="mt-3">
            <Form.Label>University</Form.Label>
            <Form.Select
              name="University"
              value={form.University}
              onChange={handleChange}
              required
            >
              <option value="">Select University</option>
              {university?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Website URL */}
          <Form.Group className="mt-3">
            <Form.Label>Website URL</Form.Label>
            <Form.Control
              type="text"
              name="WebsiteURL"
              value={form.WebsiteURL}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Location */}
          <Form.Group className="mt-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              name="Location"
              value={form.Location}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Duration */}
          <Form.Group className="mt-3">
            <Form.Label>Duration</Form.Label>
            <Form.Control
              type="text"
              name="Duration"
              value={form.Duration}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Broucher */}
          <Form.Group className="mt-3">
            <Form.Label>Broucher</Form.Label>
            <Form.Control
              type="file"
              name="broucherURL"
              onChange={handleChange}
            />
            {broucherPreview && (
              <img
                src={broucherPreview}
                alt="broucher"
                className="mt-2 img-fluid rounded"
              />
            )}
          </Form.Group>

          {/* Category */}
          <Form.Group className="mt-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="Category"
              value={form.Category}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {categories.map((ele) => (
                <option key={ele} value={ele}>
                  {ele}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Intake Section */}
          <div className="mt-3">
            <Form.Label className="fw-bold">Intakes</Form.Label>
            {form.Intake.map((intake, idx) => (
              <div key={idx} className="border rounded p-2 mb-2">
                <Form.Select
                  value={intake.status ? "active" : "notActive"}
                  onChange={(e) =>
                    handleIntakeChange(idx, "status", e.target.value === "active")
                  }
                >
                  <option value="active">Active</option>
                  <option value="notActive">Not Active</option>
                </Form.Select>
                <Form.Label className="fw-bold">Start Intake</Form.Label>

                <Form.Control
                  type="text"
                  value={intake.date}
                  onChange={(e) =>
                    handleIntakeChange(idx, "date", e.target.value)
                  }
                  className="mt-2"
                />
                <Form.Label className="fw-bold">End Intake</Form.Label>

                <Form.Control
                  type="date"
                  value={intake.end_date}
                  onChange={(e) =>
                    handleIntakeChange(idx, "end_date", e.target.value)
                  }
                  className="mt-2"
                />

                <div className="ms-auto d-flex gap-2 mt-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeIntake(idx)}
                  >
                    ×
                  </Button>
                  <Button variant="success" size="sm" onClick={addIntake}>
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Scholarships */}
          <Form.Group className="mt-3 d-flex align-items-center gap-2">
            <Form.Check
              type="checkbox"
              id="scholarships"
              checked={form.Scholarships}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  Scholarships: e.target.checked,
                }))
              }
            />
            <Form.Label htmlFor="scholarships" className="mb-0 fw-semibold">
              Scholarships Available
            </Form.Label>
          </Form.Group>

          {/* Program Level */}
          <Form.Group className="mt-3">
            <Form.Label>Program Level</Form.Label>
            <Form.Select
              name="ProgramLevel"
              value={form.ProgramLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {level.map((ele) => (
                <option key={ele} value={ele}>
                  {ele}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Language Requirement */}
          <div className="mt-3 p-3 border rounded">
            <Form.Label className="fw-bold d-block mb-2">
              Language Requirement
            </Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="checkbox"
                label="English Required"
                name="english"
                checked={form.languageRequire.english}
                onChange={handleChange}
              />

              <Form.Check
                type="checkbox"
                label="Mother Tongue"
                name="motherTongue"
                checked={form.languageRequire.motherTongue}
                onChange={handleChange}
              />
              <Form.Check
                type="checkbox"
                label="No Require"
                name="no_any_preference"
                checked={form.languageRequire.no_any_preference}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Eligibility */}
          <Form.Group className="mt-3">
            <Form.Label>Eligibility</Form.Label>
            <TextEditor
              content={form.Eligibility}
              setContent={handleContentChange}
            />
          </Form.Group>

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
                  <option value="">Select</option>
                  <option value="semester">Semester</option>
                  <option value="year">Year</option>
                  <option value="total">Total</option>
                </Form.Select>
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
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {ele?._id ? "Update Course" : "Create Course"}
        </Button>
      </Modal.Footer>
      <ToastContainer position="top-right" theme="colored" />
    </Modal>
  );
};

export default CreateMbbsCourse;
