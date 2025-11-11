import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Modal,
  Button,
  Form,
  Accordion,
  Card,
  Row,
  Col
} from 'react-bootstrap';
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAbroadStudyThunk, updateAbroadStudy } from "../slice/AbroadSlice";
import TextEditor from "./TextEditor";
import { createMbbstudyThunk } from "../slice/MbbsSlice";

const storage = getStorage(app);

const CreateMbbsForm = ({loadAbroadStudy, ele, handleClose }) => {
  const [sectionPreviews, setSectionPreviews] = useState([]);
  const dispatch = useDispatch();                                                                                                                                                   
      console.log(ele);
      
  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL:ele?.bannerURL || "",
    bullet:ele?.bullet || "",
    mbbsAbroad: ele?.mbbsAbroad || true,
    flagURL: ele?.flagURL || "",
    description:ele?.description || "",
    sectionExpanded: true ,
sections: ele?.sections
  ? ele.sections.map(sec => ({
      title: sec.title || "",
      description: sec.description || "",
      url: sec.url || "",
      _id: sec._id || undefined, // keep _id if needed
    }))
  : [{ title: "", description: "", url: "" }]
,
    eligiblity:ele?.eligibility || ["", "", "", "", "", "", ""],
    faq: ele?.faq || [{ question: "", answer: "" }],
  });
  const [bannerPreview, setBannerPreview] = useState(null);
  const [flagPreview, setFlagPreview] = useState(null);

    const [uploads, setUploads] = useState({
    banner: { progress: 0, preview: null, name: "", loading: false },
    thumbnail: { progress: 0, preview: null, name: "", loading: false },
  });

  const [errors, setErrors] = useState({});

  const handleChange = async (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (name.includes('sections') && name.includes('url')) {
          // Handling the file for `url` field in sections
          const isValid = await validateImage(file, 300, 300); // Example image size for section URL image
          if (!isValid) {
            setErrors((prev) => ({
              ...prev,
              [name]: `Image must be at least 300px x 300px`,
            }));
          } else {
            setErrors((prev) => ({ ...prev, [name]: '' }));
            const imageURL = await uploadImage(file);
            const index = parseInt(name.split('.')[1]);
            const updatedSections = [...form.sections];
            updatedSections[index].url = imageURL;

            setForm({ ...formValues, sections: updatedSections });

            // Set image preview
            const updatedPreviews = [...sectionPreviews];
            updatedPreviews[index] = URL.createObjectURL(file);
            setSectionPreviews(updatedPreviews);
          }
        } else {
         
          const imageURL = await uploadImage(file);
          if (name === 'bannerURL') {
            setBannerPreview(URL.createObjectURL(file));
            setForm((prevValues) => ({ ...prevValues, [name]: imageURL }));
          } else if (name === 'flagURL') {
            setFlagPreview(URL.createObjectURL(file));
            setForm((prevValues) => ({ ...prevValues, [name]: imageURL }));
          }
        }
      }
    } else if (name.includes('sections') || name.includes('faq')) {
      const [sectionOrFaq, index, field] = name.split('.');
      const updatedArray = [...formValues[sectionOrFaq]];
      updatedArray[index][field] = value;
      setForm({ ...formValues, [sectionOrFaq]: updatedArray });
    } else {
      setForm((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
    validateForm();
  };

    const handleFileChange = async (event, type) => {
      const file = event.target.files[0];
      if (!file) return;
  
      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: true, name: file.name },
      }));
  
      try {
        const previewURL = URL.createObjectURL(file);
  
        const progressInterval = setInterval(() => {
          setUploads((prev) => ({
            ...prev,
            [type]: {
              ...prev[type],
              progress: Math.min(prev[type].progress + 10, 90),
            },
          }));
        }, 200);
  
        const storageRef = ref(storage, `${type}/${file.name}`);
        await uploadBytesResumable(storageRef, file);
        const url = await getDownloadURL(storageRef);
  
        clearInterval(progressInterval);
  
        setForm((prev) => ({ ...prev, [`${type}URL`]: url }));
        setUploads((prev) => ({
          ...prev,
          [type]: { progress: 100, preview: previewURL, name: file.name, loading: false },
        }));
  
        toast.success(`${type} uploaded successfully!`);
      } catch (error) {
        console.error(`Failed to upload ${type}:`, error);
        setUploads((prev) => ({
          ...prev,
          [type]: { progress: 0, preview: null, name: "", loading: false },
        }));
        toast.error(`Failed to upload ${type}`);
      }
    };

    const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

 const handleDescriptionChange = (value) => {
  setForm((prev) => ({
    ...prev,
    sections: {
      ...prev.sections,
      description: value,
    },
  }));
  setErrors((prev) => ({ ...prev, description: "" }));
};


    const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.bannerURL.trim()) newErrors.bannerURL = "Banner image is required";
    if (!form.bullet.trim()) newErrors.bullet = "Bullet is required";
    if (!form.flagURL.trim()) newErrors.flagURL = "Flag image is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSection = () => {
    setForm((prevValues) => ({
      ...prevValues,
      sections: [...prevValues.sections, { title: '', description: '', url: '' }],
    }));
    setSectionPreviews([...sectionPreviews, '']);
  };

  const removeSection = (index) => {
    setForm((prevValues) => ({
      ...prevValues,
      sections: prevValues.sections.filter((_, i) => i !== index),
    }));
    setSectionPreviews(sectionPreviews.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setForm((prevValues) => ({
      ...prevValues,
      faq: [...prevValues.faq, { question: '', answer: '' }],
    }));
  };

  const removeFaq = (index) => {
    setForm((prevValues) => ({
      ...prevValues,
      faq: prevValues.faq.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
        if(ele && ele._id) {
            // Update existing country
            // console.log("form",form);
            
            const res = await dispatch(updateAbroadStudy({ id: ele._id, data: form }));
            if (updateAbroadStudy.fulfilled.match(res)) {
                toast.success("✅ Country updated successfully!");
                handleClose();
            }
            else if (updateAbroadStudy.rejected.match(res)) {
                  // Failure case with detailed error
                  const errorMsg =
                    res.payload?.message || res.error?.message || "Unknown error occurred.";
                  toast.error("❌ Failed to update country: " + errorMsg);
                }
        }else{
            // Create new country
            // console.log(form,"+++++++++++++++++++++");
            
            const res = await dispatch(createMbbstudyThunk(form));
            // console.log(res);
            
            if (createAbroadStudyThunk.fulfilled.match(res)) {
                toast.success("✅ Country created successfully!");
                loadAbroadStudy()
                handleClose();
            } else if (createAbroadStudyThunk.rejected.match(res)) {
                // Failure case with detailed error
                const errorMsg =
                    res.payload?.message || res.error?.message || "Unknown error occurred.";
                toast.error("❌ Failed to create country: " + errorMsg);
            }
        }
    } catch (error) {
        console.error("Failed to create country:", error);
        toast.error("Failed to create country");
    }
  }
  return(
    <Modal show={open} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="text-black">
        <Modal.Title>Add Country</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Banner Image (1500x500)</Form.Label>
            <Form.Control
              type="file"
              name="bannerURL"
              onChange={(e)=>{
                handleFileChange(e,"banner")
              }}
              isInvalid={!!errors.bannerURL}
            />
            {form.bannerURL && <img src={form.bannerURL} alt="Banner" className="mt-2 img-fluid rounded" />}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Flag Image (200x200)</Form.Label>
            <Form.Control
              type="file"
              name="flagURL"
              onChange={(e)=>{
                handleFileChange(e,"flag")
              }}
              isInvalid={!!errors.flagURL}
            />
            {form?.flagURL && <img src={form?.flagURL} alt="Flag" className="mt-2 rounded-circle" width="100" />}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Bullet Point</Form.Label>
            <Form.Control type="text" name="bullet" value={form.bullet}  onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor name="description" content={form.description} setContent={handleContentChange} />
          </Form.Group>

          {/* Sections */}
          <Accordion className="mt-4">
            {form?.sections?.map((section, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>Section {index + 1}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name={`sections.${index}.title`}
                      value={section.title}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Description (max 100 words)</Form.Label>
                    <TextEditor
                      name={`sections.${index}.description`}
                      content={section.description || 0}
                      setContent={(value)=>{handleDescriptionChange(index, value)}}
                      // onChange={handleChange}
                    />
                    {/* {section?.description } */}
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Section Image (300x300)</Form.Label>
                    <Form.Control
                      type="file"
                      name={`sections.${index}.url`}
                      onChange={handleFileChange}
                    />
                    {sectionPreviews[index] && (
                      <img src={sectionPreviews[index]} alt="Preview" className="mt-2 img-fluid rounded" />
                    )}
                  </Form.Group>

                  <Button variant="danger" className="mt-3" onClick={() => removeSection(index)}>
                    Remove Section
                  </Button>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <Button className="mt-3" variant="outline-primary" onClick={addSection}>
            Add Section
          </Button>

          {/* FAQ */}
          <Accordion className="mt-4">
            {form.faq.map((faq, index) => (
              <Accordion.Item eventKey={`faq-${index}`} key={index}>
                <Accordion.Header>FAQ {index + 1}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group>
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                      type="text"
                      name={`faq.${index}.question`}
                      value={faq.question}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Answer</Form.Label>
                    <Form.Control
                      type="text"
                      name={`faq.${index}.answer`}
                      value={faq.answer}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button variant="danger" className="mt-3" onClick={() => removeFaq(index)}>
                    Remove FAQ
                  </Button>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <Button className="mt-3" variant="outline-primary" onClick={addFaq}>
            Add FAQ
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {ele && ele._id ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateMbbsForm;
