import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Accordion } from 'react-bootstrap';
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "./TextEditor";
import { createAbroadProvince, updateAbroadProvince } from "../slice/AbroadProvinceSlice.js";
import { fetchAbroadStudy } from "../slice/AbroadSlice.js";

const CreateAbroadProvince = ({ ele, handleClose, loadProvince }) => {
  const storage = getStorage(app);
  const dispatch = useDispatch();
  const { studyAbroad } = useSelector((state) => state.abroadStudy);

  const [form, setForm] = useState({
    ProgramName: ele?.ProgramName || "",
    University: ele?.University || "", // will store ObjectId from dropdown/select
    WebsiteURL: ele?.WebsiteURL || "",
    Location: ele?.Location || "",
    Duration: ele?.Duration || "",
    broucherURL: ele?.broucherURL || "",
    Category: ele?.Category || "",
    Intake: ele?.Intake || [
      {
        status: true,
        date: "",
        expiresAt: "",
      },
    ],
    Scholarships: ele?.Scholarships ?? false,
    ProgramLevel: ele?.ProgramLevel || "",
    languageRequire: ele?.languageRequire || {
      english: false,
      no_any_preference: false,
      motherTongue: false,
    },
    Eligibility: ele?.Eligibility || "",
    Fees: ele?.Fees || 0,
  });


  const [bannerPreview, setBannerPreview] = useState(ele?.bannerURL || null);
  const [heroPreview, setHeroPreview] = useState(ele?.heroURL || null);
  const [sectionPreviews, setSectionPreviews] = useState(
    ele?.sections?.map(s => s.url) || []
  );

  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});

  // 🔹 Upload helper with progress
  const uploadImage = (file, key) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `provinces/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prev => ({ ...prev, [key]: progress }));
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;

    // File uploads
    if (type === "file") {
      const file = files[0];
      if (!file) return;

      try {
        if (name === "bannerURL") {
          setBannerPreview(URL.createObjectURL(file));
          const url = await uploadImage(file, "banner");
          setForm(prev => ({ ...prev, bannerURL: url }));
        } else if (name === "heroURL") {
          setHeroPreview(URL.createObjectURL(file));
          const url = await uploadImage(file, "hero");
          setForm(prev => ({ ...prev, heroURL: url }));
        } else if (name.startsWith("section-")) {
          const index = parseInt(name.split("-")[1]);
          setSectionPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = URL.createObjectURL(file);
            return newPreviews;
          });
          const url = await uploadImage(file, `section-${index}`);
          setForm(prev => {
            const newSections = [...prev.sections];
            newSections[index] = { ...newSections[index], url };
            return { ...prev, sections: newSections };
          });
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    // Section text inputs
    else if (name.startsWith("section-")) {
      const [_, index, field] = name.split("-");
      setForm(prev => {
        const newSections = [...prev.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        return { ...prev, sections: newSections };
      });
    }
    // Country select
    else if (name === "Country") {
      const selectedCountry = studyAbroad.find(c => c._id === value) || null;
      setForm(prev => ({ ...prev, Country: selectedCountry }));
    }
    // Normal inputs
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value) => {
    setForm(prev => ({ ...prev, description: value }));
    setErrors(prev => ({ ...prev, description: "" }));
  };

  const handleContentChangeSection = (index, value) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map((sec, i) => i === index ? { ...sec, description: value } : sec)
    }));
    setErrors(prev => ({ ...prev, description: "" }));
  };

  const addSection = () => {
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', description: '', url: '' }]
    }));
    setSectionPreviews(prev => [...prev, '']);
  };

  const removeSection = (index) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    setSectionPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.bannerURL || !form.description) {
        toast.error("Please fill all required fields!");
        return;
      }

      if (ele && ele._id) {
        // update
        const res = await dispatch(updateAbroadProvince({ id: ele._id, data: form }));
        if (updateAbroadProvince.fulfilled.match(res)) {
          toast.success("✅ Province updated successfully!");
          handleClose();
          loadProvince();
        } else {
          toast.error(res.payload?.message || "Failed to update province");
        }
      } else {
        // create
        const res = await dispatch(createAbroadProvince(form));
        console.log(res);
        
        if (createAbroadProvince.fulfilled.match(res)) {
          toast.success("✅ Province created successfully!");
          handleClose();
          loadProvince();
        } else {
          toast.error(res.payload?.message || "Failed to create province");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    dispatch(fetchAbroadStudy());
  }, [dispatch]);

  return (
    <Modal show={true} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{ele?._id ? "Update Province" : "Add Province"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={ele.name} onChange={handleChange} />
          </Form.Group>

          {/* Banner */}
          <Form.Group className="mt-3">
            <Form.Label>Banner Image</Form.Label>
            <Form.Control type="file" name="bannerURL" onChange={handleChange} />
            {bannerPreview && <img src={bannerPreview} alt="Banner" width="200" className="mt-2" />}
            {uploadProgress.banner && <p>Uploading: {uploadProgress.banner}%</p>}
          </Form.Group>

          {/* Hero */}
          <Form.Group className="mt-3">
            <Form.Label>Hero Image</Form.Label>
            <Form.Control type="file" name="heroURL" onChange={handleChange} />
            {heroPreview && <img src={heroPreview} alt="Hero" width="100" className="mt-2 rounded-circle" />}
            {uploadProgress.hero && <p>Uploading: {uploadProgress.hero}%</p>}
          </Form.Group>

          {/* Description */}
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor content={ele.description} setContent={handleContentChange} />
          </Form.Group>

          {/* Sections */}
          <Accordion className="mt-3">
            {ele?.sections.map((section, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={idx}>
                <Accordion.Header>Section {idx + 1}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" name={`section-${idx}-title`} value={section.title} onChange={handleChange} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Description</Form.Label>
                    <TextEditor content={section.description} setContent={(val) => handleContentChangeSection(idx, val)} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Section Image</Form.Label>
                    <Form.Control type="file" name={`section-${idx}-url`} onChange={handleChange} />
                    {sectionPreviews[idx] && <img src={sectionPreviews[idx]} alt="Section" width="150" className="mt-2" />}
                    {uploadProgress[`section-${idx}`] && <p>Uploading: {uploadProgress[`section-${idx}`]}%</p>}
                  </Form.Group>

                  <Button variant="danger" className="mt-2" onClick={() => removeSection(idx)}>Remove Section</Button>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <Button className="mt-3" onClick={addSection}>Add Section</Button>

          {/* Country Select */}
          <Form.Group className="mt-3">
            <Form.Label>Country</Form.Label>
            <Form.Select name="Country" value={ele.Country?._id || ""} onChange={handleChange}>
              <option value="">Select Country</option>
              {studyAbroad?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>{ele?._id ? "Update" : "Submit"}</Button>
      </Modal.Footer>

      <ToastContainer position="top-right" theme="colored" />
    </Modal>
  );
};

export default CreateAbroadProvince;
