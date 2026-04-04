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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAbroadStudyThunk, updateAbroadStudy } from "../slice/AbroadSlice";
import TextEditor from "./TextEditor";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
};

function sectionUrlForPayload(section, index, sectionFiles) {
  if (sectionFiles[index]) return "";
  const url = section.url ?? "";
  if (typeof url === "string" && url.startsWith("data:")) return "";
  return url;
}

function countryFormToFormData(form, sectionFiles = []) {
  const fd = new FormData();

  const sectionsForApi = (form.sections ?? []).map((section, index) => {
    const row = {
      title: section.title ?? "",
      description: section.description ?? "",
      url: sectionUrlForPayload(section, index, sectionFiles),
    };
    if (section._id) row._id = section._id;
    return row;
  });

  fd.append("name", form.name ?? "");
  fd.append("bannerURL", form.bannerFile ? form.bannerFile : String(form.bannerURL ?? "").trim());
  fd.append("bullet", form.bullet ?? "");
  fd.append("mbbsAbroad", String(form.mbbsAbroad ?? false));
  fd.append("flagURL", form.flagFile ? form.flagFile : String(form.flagURL ?? "").trim());
  fd.append("description", form.description ?? "");
  fd.append("sections", JSON.stringify(sectionsForApi));
  fd.append("elegiblity", JSON.stringify(form.eligiblity ?? []));
  fd.append("faq", JSON.stringify(form.faq ?? []));

  sectionFiles.forEach((file) => {
    if (file) {
      fd.append("sectionUrl", file, file.name);
    }
  });

  return fd;
}

const CreateCountry = ({ loadAbroadStudy, ele, handleClose }) => {
  const [sectionPreviews, setSectionPreviews] = useState([]);
  const dispatch = useDispatch();


  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL: ele?.bannerURL || "",
    bannerFile: null,
    bullet: ele?.bullet || "",
    mbbsAbroad: ele?.mbbsAbroad || false,
    flagURL: ele?.flagURL || "",
    flagFile: null,
    description: ele?.description || "",
    sectionExpanded: true,
    sections: ele?.sections
      ? ele.sections.map((section) => ({
          title: section.title || "",
          description: section.description || "",
          url: section.url || "",
          _id: section._id || undefined,
        }))
      : [{ title: "", description: "", url: "" }],
    eligiblity: ele?.eligibility || ["", "", "", "", "", "", ""],
    faq: ele?.faq || [{ question: "", answer: "" }],
  });

  const [uploads, setUploads] = useState({
    banner: { progress: 0, preview: null, name: "", file: null },
    flag: { progress: 0, preview: null, name: "", file: null },
  });

  const [sectionFiles, setSectionFiles] = useState(() => {
    if (ele?.sections?.length) {
      return Array.from({ length: ele.sections.length }, () => null);
    }
    return [null];
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    if (type === 'file') return;

    if (name.includes('sections') || name.includes('faq')) {
      const [sectionOrFaq, index, field] = name.split('.');
      const updatedArray = [...form[sectionOrFaq]];
      updatedArray[index][field] = value;
      setForm({ ...form, [sectionOrFaq]: updatedArray });
    } else {
      setForm((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
    validateForm();
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads((prev) => ({
      ...prev,
      [type]: { progress: 100, preview: previewURL, name: file.name, file },
    }));

    if (type === "banner") {
      setForm((prev) => ({
        ...prev,
        bannerFile: file,
      }));
      setErrors((prev) => ({ ...prev, bannerURL: "" }));
    } else if (type === "flag") {
      setForm((prev) => ({
        ...prev,
        flagFile: file,
      }));
      setErrors((prev) => ({ ...prev, flagURL: "" }));
    }
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };


  const handleContentChangeSection = (index, value) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, description: value } : section
      ),
    }));
    setErrors((prev) => ({ ...prev, description: "" }));

  };


  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    const hasBanner = form.bannerFile || String(form.bannerURL || "").trim();
    if (!hasBanner) newErrors.bannerURL = "Banner image is required";
    if (!form.bullet.trim()) newErrors.bullet = "Bullet is required";
    const hasFlag = form.flagFile || String(form.flagURL || "").trim();
    if (!hasFlag) newErrors.flagURL = "Flag image is required";
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
    setSectionFiles((prev) => [...prev, null]);
  };

  const removeSection = (index) => {
    setForm((prevValues) => ({
      ...prevValues,
      sections: prevValues.sections.filter((_, i) => i !== index),
    }));
    setSectionPreviews(sectionPreviews.filter((_, i) => i !== index));
    setSectionFiles((prev) => prev.filter((_, i) => i !== index));
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

  const handleSectionImageChange = (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSectionFiles((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push(null);
      next[index] = file;
      return next;
    });
    setSectionPreviews((prev) => {
      const next = [...prev];
      next[index] = URL.createObjectURL(file);
      return next;
    });
    setErrors((prev) => ({ ...prev, [`sections.${index}.url`]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const formData = countryFormToFormData(form, sectionFiles);

      if (ele && ele._id) {
        const res = await dispatch(updateAbroadStudy({ id: ele._id, data: formData }));
        console.log(res,"res+++++++++++++++++++++++++++++");
        if (updateAbroadStudy.fulfilled.match(res)) {
          toast.success("✅ Country updated successfully!");
          loadAbroadStudy?.();
          handleClose();
        }
        else if (updateAbroadStudy.rejected.match(res)) {
          // Failure case with detailed error
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update country: " + errorMsg);
        }
      } else {
        const res = await dispatch(createAbroadStudyThunk(formData));
        if (createAbroadStudyThunk.fulfilled.match(res)) {
          toast.success("✅ Country created successfully!");
          loadAbroadStudy?.();
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
  return (
    <Modal show onHide={handleClose} size="lg" centered scrollable>
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
              onChange={(e) => {
                handleFileChange(e, "banner")
              }}
              isInvalid={!!errors.bannerURL}
            />
            {(uploads.banner.preview || form.bannerURL) && (
              <img src={getAssetUrl(uploads.banner.preview || form.bannerURL)} alt="Banner" className="mt-2 img-fluid rounded" />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Flag Image (200x200)</Form.Label>
            <Form.Control
              type="file"
              name="flagURL"
              onChange={(e) => {
                handleFileChange(e, "flag")
              }}
              isInvalid={!!errors.flagURL}
            />
            {(uploads.flag.preview || form.flagURL) && (
              <img src={getAssetUrl(uploads.flag.preview || form.flagURL)} alt="Flag" className="mt-2 rounded-circle" width="100" />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Bullet Point</Form.Label>
            <Form.Control type="text" name="bullet" value={form.bullet} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor name="description" content={form?.description} setContent={handleContentChange} />
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
                      content={section?.description || 0}
                      setContent={(value) => { handleContentChangeSection(index, value) }}
                    // onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Section Image (300x300)</Form.Label>
                    <Form.Control
                      type="file"
                      name={`sections.${index}.url`}
                      accept="image/*"
                      onChange={(e) => handleSectionImageChange(e, index)}
                    />
                    {(sectionPreviews[index] || section.url) && (
                      <img src={getAssetUrl(sectionPreviews[index] || section.url)} alt="Preview" className="mt-2 img-fluid rounded" />
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

export default CreateCountry;
