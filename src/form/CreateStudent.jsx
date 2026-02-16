import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPartner, updatePartner } from "../slice/PartnerSlice";
import { createAssessment, updateAssessment } from "../slice/AssessmentSlice";
import { allCountry } from "../slice/AbroadSlice";
import { useSelector } from "react-redux";

const storage = getStorage(app);
const categories = [
  'Arts',
  'Accounts',
  'Finance',
  'Marketing',
  'Science',
  'Medical',
  'Computers',
  'Engineering',
  'Law',
  'Education',
  'Social Sciences',
  'Business Administration',
  'Psychology',
  'Economics',
  'Architecture',
  'Environmental Science',
  'Nursing',
  'Hospitality Management',
  'Media and Communication',
  'Information Technology',
  'Pharmacy',
  'Agriculture',
  'Design',
  'Public Health',
  'Mathematics',
  'Data Science',
  'Artificial Intelligence'
];

const CreateStudent = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();
  const { allCountries } = useSelector(state => state.abroadStudy);
  console.log(ele, "???????????????????????????????????");

  const fetchAllCountries = async () => {
    const res = await dispatch(allCountry())
    console.log(res);
  }
  // align keys with Mongoose schema
  const initial = {
    trackingId: ele?.trackingId || "",
    firstName: ele?.firstName || "",
    middleName: ele?.middleName || "",
    lastName: ele?.lastName || "",
    city: ele?.city || "",
    gender: ele?.gender || "",
    adhaar: ele?.adhaar || "",
    passportNumber: ele?.passportNumber || "",
    dob: ele?.dob || "",
    address: ele?.address || "",
    pincode: ele?.pincode || "",
    mobileNumber: ele?.mobileNumber || "",
    emailID: ele?.emailID || "",
    courselevel: ele?.courselevel || "",
    grade: ele?.grade || "",
    qualifiedTestName: ele?.qualifiedTestName || "",
    qualifiedTestYear: ele?.qualifiedTestYear || "",
    qualifiedTestResultType: ele?.qualifiedTestResultType || "",
    qualifiedTestImage: ele?.qualifiedTestImage || "",
    qualifiedTestGrade: ele?.qualifiedTestGrade || "",
    lastEdu: ele?.lastEdu || "",
    lastQualificationCourseName: ele?.lastQualificationCourseName || "",
    lastQualificationSpecialization: ele?.lastQualificationSpecialization || "",
    category: ele?.category || "",
    lastQualificationResultType: ele?.lastQualificationResultType || "",
    englishtestimage: ele?.englishtestimage || "",
    yearOfPassing: ele?.yearOfPassing || "",
    gradesInLastYear: ele?.gradesInLastYear || "",
    english12Grade: ele?.english12Grade || "",
    english12ResultType: ele?.english12ResultType || "",
    englishTest: ele?.englishTest || "",
    englishTestYear: ele?.englishTestYear || "",
    remarks: ele?.remarks || "",
    Country: ele?.Country || "",
    Course: ele?.Course || "",
    specialization: ele?.specialization || "",
    resume: ele?.resume || "",
    lastQualificationResultType: ele?.lastQualificationResultType || "",
    englishTestScorecard: ele?.englishTestScorecard || "",
    acadmics: ele?.acadmics || "",
    englishTestDoc: ele?.englishTestDoc || "",
    workExperienceDoc: ele?.workExperienceDoc || "",
    workExperience: ele?.workExperience ?? false,
  };

  const [formValues, setFormValues] = useState(initial);

  useEffect(() => {
    setFormValues(prev => ({ ...prev, ...(ele || {}) }));
    // populate upload previews from ele if available
    // eslint-disable-next-line
    fetchAllCountries()
  }, [ele]);
  const [uploadingField, setUploadingField] = useState(null);

  const [uploads, setUploads] = useState({
    resume: { progress: 0, preview: initial.resume || null, loading: false },
    englishTestScorecard: { progress: 0, preview: initial.englishTestScorecard || null, loading: false },
    acadmics: { progress: 0, preview: initial.acadmics || null, loading: false },
    englishTestDoc: { progress: 0, preview: initial.englishTestDoc || null, loading: false },
    workExperienceDoc: { progress: 0, preview: initial.workExperienceDoc || null, loading: false },
    qualifiedTestImage: { progress: 0, preview: initial.qualifiedTestImage || null, loading: false },
    englishtestimage: { progress: 0, preview: initial.englishtestimage || null, loading: false },
  });

  // keep uploads previews in sync when ele changes
  useEffect(() => {
    if (!ele) return;
    setUploads(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (ele[k]) next[k].preview = ele[k];
      });
      return next;
    });
  }, [ele]);

  const anyUploading = () => Object.values(uploads).some(u => u.loading === true);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: true, preview: previewURL, progress: 0 } }));

    const storageRef = ref(storage, `partners/${fieldName}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], progress } }));
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("Failed to upload " + fieldName);
        setUploads(prev => ({ ...prev, [fieldName]: { progress: 0, preview: null, loading: false } }));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormValues(prev => ({ ...prev, [fieldName]: url }));
        setUploads(prev => ({ ...prev, [fieldName]: { ...prev[fieldName], loading: false, progress: 100, preview: url } }));
        toast.success(`${fieldName} uploaded`);
      }
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.Country?.trim()) newErrors.Country = "Country is required";
    if (!formValues.emailID?.trim()) newErrors.emailID = "Email is required";
    if (!formValues.mobileNumber?.trim()) newErrors.mobileNumber = "Mobile number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [errors, setErrors] = useState({});

  const fileFields = [
    "resume",
    "englishTestScorecard",
    "acadmics",
    "englishTestDoc",
    "workExperienceDoc",
    "qualifiedTestImage",
    "englishtestimage",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (anyUploading()) {
    //   toast.error("Please wait for file uploads to finish.");
    //   return;
    // }

    // if (!validateForm()) {
    //   toast.error("Please fix validation errors.");
    //   return;
    // }

    try {
      const payload = { ...formValues };

      // Remove empty User field (User is ObjectId ref, not string)
      if (payload.User == null || (typeof payload.User === "string" && payload.User.trim() === "")) {
        delete payload.User;
      }

      // Remove empty dob if not set
      if (!payload.dob) {
        delete payload.dob;
      }
      if (payload.DateOfBirth) {
        payload.DateOfBirth = new Date(payload.DateOfBirth).toISOString();
      }

      // don't overwrite password with empty value on update
      if (ele && ele._id && !payload.password) delete payload.password;

      if (ele && ele._id) {
        const res = await dispatch(updateAssessment({ id: ele._id, data: payload }));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Lead updated");
          fetchData?.();
          handleClose?.();
        } else {
          const msg = res?.payload?.message || res?.error?.message || "Update failed";
          toast.error(msg);
        }
      } else {

        const res = await dispatch(createAssessment(payload));
        if (res?.meta?.requestStatus === "fulfilled") {
          toast.success("Lead created");
          fetchData?.();
          handleClose?.();
        } else {
          const msg = res?.payload?.message || res?.error?.message || "Creation failed";
          toast.error(msg);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg" style={{ maxWidth: 1000 }}>
          <div className="modal-content p-20">
            <div className="modal-header">

              <h5 className="modal-title">{ele ? "Edit Lead" : "Create Lead"}</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted">Tracking ID {ele?.trackingId && "(read-only)"}</label>
                    <input name="trackingId" value={formValues.trackingId} onChange={handleInputChange} readOnly={!!ele?.trackingId} className={`form-control form-control-sm ${ele?.trackingId ? 'bg-light' : ''}`} placeholder={ele?.trackingId ? '' : 'Optional'} />
                  </div>

                  {/* ——— Personal Details ——— */}
                  <div className="col-12">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #0d9488', paddingBottom: 8 }}>
                      Personal Details
                    </h6>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input name="firstName" value={formValues.firstName} onChange={handleInputChange} className="form-control" placeholder="Candidate First Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input name="middleName" value={formValues.middleName} onChange={handleInputChange} className="form-control" placeholder="Candidate Middle Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input name="lastName" value={formValues.lastName} onChange={handleInputChange} className="form-control" placeholder="Candidate Last Name" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={formValues.gender} onChange={handleInputChange} className="form-control">
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Aadhar Number</label>
                    <input name="adhaar" value={formValues.adhaar} onChange={handleInputChange} className="form-control" placeholder="Aadhar Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Passport Number</label>
                    <input name="passportNumber" value={formValues.passportNumber} onChange={handleInputChange} className="form-control" placeholder="Passport Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Mobile Number</label>
                    <input name="mobileNumber" value={formValues.mobileNumber} onChange={handleInputChange} className="form-control" placeholder="Mobile Number" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email Address</label>
                    <input name="emailID" value={formValues.emailID} onChange={handleInputChange} type="email" className="form-control" placeholder="Email Address" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input name="city" value={formValues.city} onChange={handleInputChange} className="form-control" placeholder="City" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input name="address" value={formValues.address} onChange={handleInputChange} className="form-control" placeholder="Address" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pincode</label>
                    <input name="pincode" value={formValues.pincode} onChange={handleInputChange} className="form-control" placeholder="Pincode" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="dob" value={formValues.dob} onChange={handleInputChange} className="form-control" placeholder="mm/dd/yyyy" />
                  </div>

                  {/* ——— Applied For Course ——— */}
                  <div>
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #0d9488', paddingBottom: 8 }}>
                      Applied For Course
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="label" htmlFor="programLevel">Select Program Level</label>
                    <select name="category" id="category" value={formValues.programLevel} className="form-select">
                      <option value="">Select Category</option>

                      {["PG", "UG", "Diploma"].map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Enter Course Level (Category)</label>
                    <select value={formValues?.category ?? ''} name="category" id="category" className="form-select">
                      <option value="">Select Category</option>

                      {[
                        'Arts',
                        'Accounts',
                        'Finance',
                        'Marketing',
                        'Science',
                        'Medical',
                        'Computers',
                        'Engineering',
                        'Law',
                        'Education',
                        'Social Sciences',
                        'Business Administration',
                        'Psychology',
                        'Economics',
                        'Architecture',
                        'Environmental Science',
                        'Nursing',
                        'Hospitality Management',
                        'Media and Communication',
                        'Information Technology',
                        'Pharmacy',
                        'Agriculture',
                        'Design',
                        'Public Health',
                        'Mathematics',
                        'Data Science',
                        'Artificial Intelligence'
                      ].map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Course Name</label>
                    <input name="Course" value={formValues.Course} onChange={handleInputChange} className="form-control" placeholder="Course Name" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Specialization Name</label>
                    <input name="specialization" value={formValues.specialization} onChange={handleInputChange} className="form-control" placeholder="Specialization Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <select name="Country" value={formValues.Country} onChange={handleInputChange} className="form-control">
                      <option value="">Select Country</option>
                      {(allCountries || []).map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Course Level</label>
                    <input name="courselevel" value={formValues.courselevel} onChange={handleInputChange} className="form-control" placeholder="Course Level" />
                  </div>


                  {/* ——— Latest Qualification ——— */}
                  <div className="col-12 mt-4">
                    <h6 className="mb-3" style={{ fontWeight: 600, borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>
                      Latest Qualification
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Select Last Qualification</label>
                    <select name="lastEdu" value={formValues.lastEdu} onChange={handleInputChange} className="form-control">
                      <option value="">Select Last Qualification</option>
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="DIPLOMA 10+3">Diploma 10+3</option>
                      <option value="BACHELOR DEGREE">Bachelor Degree</option>
                      <option value="BACHELOR IN TECHNOLOGY">Bachelor in Technology</option>
                      <option value="MASTER DEGREE">Master Degree</option>
                      <option value="MASTER IN TECHNOLOGY">Master in Technology</option>
                      <option value="POST GRADUATE">Post Graduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="latestQualificationCategory">Enter Course Level (Category)</label>
                    <select id="latestQualificationCategory" className="form-control" name="latestQualificationCategory" title="Select category" value={formValues?.latestQualificationCategory ?? ''} onChange={handleInputChange}>
                      <option value="">Select Category</option>
                      {categories.map((ele) => (
                        <option key={ele} value={ele}>
                          {ele}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="col-md-6">
                    <label className="form-label">Enter Course Name</label>
                    <input name="lastQualificationCourseName" value={formValues.lastQualificationCourseName} onChange={handleInputChange} className="form-control" placeholder="Course Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Specialization Name</label>
                    <input name="lastQualificationSpecialization" value={formValues.lastQualificationSpecialization} onChange={handleInputChange} className="form-control" placeholder="Specialization Name" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Year of Passing</label>
                    <input name="yearOfPassing" value={formValues.yearOfPassing} onChange={handleInputChange} className="form-control" placeholder="Passing Year" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Result Type</label>
                    <select name="lastQualificationResultType" value={formValues.lastQualificationResultType} onChange={handleInputChange} className="form-control">
                      <option value="">Select</option>
                      <option value="grade">Grade</option>
                      <option value="score">Score</option>
                    </select>
                  </div>

                  <div>
                    {formValues?.lastQualificationResultType === "grade" ? (
                      <div>
                        <label className="label" htmlFor="gradesInLastYear">
                          Grade
                        </label>
                        <input
                          id="gradesInLastYear"
                          className="form-control"
                          name="gradesInLastYear"
                          value={formValues?.gradesInLastYear ?? ''}
                          placeholder="Enter Grade (A, B, C...)"
                          onChange={handleInputChange}
                        />
                      </div>

                    ) : (
                      <div>
                        <label className="label" htmlFor="gradesInLastYear">
                          Score
                        </label>
                        <input
                          id="gradesInLastYear"
                          className="form-control"
                          name="gradesInLastYear"
                          value={formValues?.gradesInLastYear ?? ''}
                          placeholder="Enter Score"
                          onChange={handleInputChange}
                        />
                      </div>
                    )}


                  </div>



                  {/* ================= Tests ================= */}
                  <div className="section">
                    <h6 className="section-title">Have You Qualified Any Test?</h6>


                    {!formValues.hasQualifiedTest && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <label className="label" htmlFor="qualifiedTestName">Test Name</label>
                          <input id="qualifiedTestName" className="form-control" title="Enter qualified test name" name="qualifiedTestName" value={formValues?.qualifiedTestName ?? ''}
                            onChange={handleInputChange} placeholder="Test Name" />
                        </div>

                        <div>
                          <label className="label" htmlFor="qualifiedTestYear">Year Of Passing</label>
                          <input id="qualifiedTestYear" className="form-control" title="Enter year of passing" name="qualifiedTestYear" value={formValues?.qualifiedTestYear ?? ''}
                            onChange={handleInputChange} placeholder="Year Of Passing" />
                        </div>


                        {/* <div>
                      <label className="label">Result Type</label>
                      <select
                       className="form-control"
                        name="qualifiedTestResultType"
                        value={formValues?.qualifiedTestResultType ?? ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="grade">Grade</option>
                        <option value="score">Score</option>
                      </select>
                    </div> */}

                        {/* {!formValues?.qualifiedTestResultType === "grade" && ( */}
                        <div>
                          <label className="label" htmlFor="qualifiedTestGrade">
                            Grade
                          </label>
                          <input
                            id="qualifiedTestGrade"
                            className="form-control"
                            name="qualifiedTestGrade"
                            value={formValues?.qualifiedTestGrade ?? ''}
                            placeholder="Enter Grade (A, B, C...)"
                            onChange={handleInputChange}
                          />
                        </div>
                        {/* )} */}


                        {/* {!formValues?.qualifiedTestResultType === "score" && ( */}
                        {/* <div>
                        <label className="label" htmlFor="qualifiedTestScore">
                          Obtained Marks
                        </label>
                        <input
                          id="qualifiedTestScore"
                          className="form-control"
                          name="qualifiedTestGrade"
                          value={formValues?.qualifiedTestGrade ?? '-----'}
                          placeholder={formValues?.qualifiedTestGrade ?? '-----'}
                          type="number"
                          onChange={handleInputChange}
                        />
                      </div> */}
                        {/* )} */}


                        {/* <div>
                    <label className="label" htmlFor="qualifiedTestGrade">Obtained Marks</label>
                    <input id="qualifiedTestGrade" className="form-control" title="Enter obtained marks" name="qualifiedTestGrade" 
                   onChange={handleInputChange}  placeholder="Obtained Marks" />
                  </div> */}

                        {/* <label htmlFor="">Add Resume</label> */}

                        {/* <input type="file" name="qualifiedTestImage"
                      onChange={handleFileChange} className="file" /> */}
                      </div>
                    )}
                  </div>

                  {/* ================= English Test ================= */}
                  <div className="section">
                    <h6 className="section-title">Have You Given Any Language Test?</h6>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="label" htmlFor="englishTest">Test Name</label>

                        <input id="englishTest" className="form-control" title="Enter obtained marks" name="englishTest"
                          onChange={handleInputChange} placeholder="Last Qualification " />
                        {/* <select
                        id="englishTest"
                        className="form-control"
                        name="englishTest"
                        title="Select english test option"
                        value={formValues?.englishTest || ""}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          Select Last Qualification
                        </option>

                        {['WITH IELTS', 'WITHOUT IELTS'].map((ele) => (
                          <option key={ele} value={ele}>
                            {ele}
                          </option>
                        ))}
                      </select> */}
                      </div>

                      <div>
                        <div>
                          <label className="label" htmlFor="englishTestYear">Year Of Passing</label>
                          <input id="englishTestYear" className="form-control" title="Enter year of passing" name="englishTestYear" value={formValues?.englishTestYear ?? ''}
                            onChange={handleInputChange} placeholder="Year Of Passing" />
                        </div>
                      </div>


                      <div>
                        <label className="label">English 12 Result Type</label>
                        <select
                          className="form-control"
                          name="english12ResultType"
                          value={formValues?.english12ResultType ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="grade">Grade</option>
                          <option value="cgpa">CGPA</option>
                        </select>
                      </div>


                      {!formValues?.english12ResultType === "grade" && (
                        <div>
                          <label className="label" htmlFor="english12Grade">
                            Grade
                          </label>
                          <input
                            id="english12Grade"
                            className="form-control"
                            name="english12Grade"
                            value={formValues?.english12Grade}
                            placeholder="Enter Grade (A, B, C...)"
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                      {!formValues?.english12ResultType === "cgpa" && (
                        <div>
                          <label className="label" htmlFor="english12Cgpa">
                            CGPA
                          </label>
                          <input
                            id="english12Cgpa"
                            className="form-control"
                            name="english12Grade"
                            value={formValues?.english12Grade}
                            placeholder="Enter CGPA (e.g. 8.5)"
                            type="number"
                            step="0.01"
                            onChange={handleInputChange}
                          />
                        </div>
                      )}

                      {/* 

                  <div>
                    <label className="label" htmlFor="english12Grade">Grade / CGPA</label>
                    <input id="english12Grade" className="form-control" title="Enter grade or CGPA" name="english12Grade" value={formValues?.english12Grade}
                   onChange={handleInputChange} placeholder="Grade / CGPA" />
                  </div> */}

                      {/* <label className="label" html For="englishtestimage">English Test Scorecard (if any)</label> */}
                      {/* <input type="file" id="englishtestimage" name="englishtestimage"
                      onChange={handleFileChange}
                      className="file" /> */}
                    </div>
                  </div>

                  <div className="container my-4">
                    <div className="card shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="fw-bold mb-2">Documents Upload</h4>
                        <p className="text-muted small mb-4">
                          Select a file to upload to Firebase; the link is saved automatically.
                        </p>

                        <div className="row g-4">
                          {[
                            { id: 'acadmics', label: 'Add Last Qualification', key: 'acadmics' },
                            { id: 'englishTestScorecard', label: 'Add Any Language Test Result', key: 'englishTestScorecard' },
                            { id: 'qualifiedTestImage', label: 'Add Any Qualified Test', key: 'qualifiedTestImage' },
                            { id: 'englishTestDoc', label: 'Any Other Test', key: 'englishTestDoc' },
                            { id: 'workExperienceDoc', label: 'Add If Any Experience', key: 'workExperienceDoc' },
                            { id: 'resume', label: 'Add Resume', key: 'resume' },
                          ].map(({ id, label, key }) => {
                            const value = formValues[key];
                            const url = typeof value === 'string' ? value : '';

                            return (
                              <div key={key} className="col-md-6">
                                <div className="card border rounded-3 h-100 shadow-sm">
                                  <div className="card-body d-flex flex-column">

                                    <label htmlFor={id} className="form-label fw-semibold">
                                      {label}
                                    </label>

                                    <input
                                      type="file"
                                      id={id}
                                      name={key}
                                      onChange={handleFileChange}
                                      className="form-control mb-2"
                                      disabled={!!uploadingField}
                                      accept="image/*,.pdf,.doc,.docx"
                                    />

                                    {uploadingField === key && (
                                      <div className="d-flex align-items-center gap-2 text-primary small">
                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                        Uploading...
                                      </div>
                                    )}

                                    {url && uploadingField !== key && (
                                      <div className="text-success small mb-2">
                                        ✓ File Saved Successfully
                                      </div>
                                    )}

                                    {url && (
                                      <div className="text-center mt-auto">
                                        <div className="border rounded p-2 bg-light">
                                          <img
                                            src={url}
                                            alt={label}
                                            className="img-fluid"
                                            style={{ maxHeight: "120px", objectFit: "contain" }}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                              e.target.nextElementSibling.classList.remove("d-none");
                                            }}
                                          />
                                          <div className="d-none text-muted small">
                                            📄 Document Preview Not Available
                                          </div>
                                        </div>

                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary mt-2"
                                        >
                                          View Document
                                        </a>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="col-12 mt-3">
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" name="workExperience" checked={formValues.workExperience} onChange={handleInputChange} />
                      Work Experience
                    </label>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea name="remarks" value={formValues.remarks} onChange={handleInputChange} className="form-control" rows={2} placeholder="Remarks" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={anyUploading()}>
                  {anyUploading() ? "Uploading..." : (ele && ele._id ? "Update Lead" : "Create Lead")}
                </button>
              </div>
            </form>




          </div>
        </div>
      </div>
    </>
  );
};

export default CreateStudent;
