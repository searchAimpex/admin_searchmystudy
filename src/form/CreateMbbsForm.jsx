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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateAbroadStudy } from "../slice/AbroadSlice";
import TextEditor from "./TextEditor";
import { createMbbstudyThunk } from "../slice/MbbsSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
};

/** `url` in JSON is a server path; empty when a new file is sent as `sections[${i}].url` (multer saves to upload/). */
function sectionUrlForPayload(sec, index, sectionFiles) {
  if (sectionFiles[index]) return "";
  const u = sec.url ?? "";
  if (typeof u === "string" && u.startsWith("data:")) return "";
  return u;
}

function mbbsFormToFormData(form, sectionFiles = []) {
  const fd = new FormData();

  const sectionsForApi = (form.sections ?? []).map((sec, i) => {
    const row = {
      title: sec.title ?? "",
      description: sec.description ?? "",
      url: sectionUrlForPayload(sec, i, sectionFiles),
    };
    if (sec._id) row._id = sec._id;
    return row;
  });

  const faq = form.faq ?? [];
  const elig = form.eligiblity ?? [];

  const name = form.name ?? "";
  const bullet = form.bullet ?? "";
  const mbbsAbroad = form.mbbsAbroad;
  const description = form.description ?? "";
  const sectionExpanded = form.sectionExpanded ?? true;

  fd.append("name", name);
  fd.append("bullet", bullet);
  fd.append("mbbsAbroad", String(mbbsAbroad));
  fd.append("description", description);
  fd.append("sectionExpanded", String(sectionExpanded));
  fd.append("sections", JSON.stringify(sectionsForApi));
  fd.append("faq", JSON.stringify(faq));
  fd.append("eligiblity", JSON.stringify(elig));

  const bannerStr =
    !form.bannerFile && form.bannerURL != null ? String(form.bannerURL).trim() : "";
  const flagStr =
    !form.flagFile && form.flagURL != null ? String(form.flagURL).trim() : "";

  if (form.bannerFile) {
    fd.append("bannerURL", form.bannerFile, form.bannerFile.name);
  } else if (bannerStr !== "") {
    fd.append("bannerURL", bannerStr);
  }

  if (form.flagFile) {
    fd.append("flagURL", form.flagFile, form.flagFile.name);
  } else if (flagStr !== "") {
    fd.append("flagURL", flagStr);
  }

  sectionFiles.forEach((file, index) => {
    if (file) {
      fd.append(`sections[${index}].url`, file, file.name);
    }
  });

  return fd;
}

const CreateMbbsForm = ({ loadAbroadStudy, ele, handleClose }) => {
  const [sectionPreviews, setSectionPreviews] = useState([]);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL: ele?.bannerURL || "",
    bannerFile: null,
    bullet: ele?.bullet || "",
    mbbsAbroad: ele?.mbbsAbroad || true,
    flagURL: ele?.flagURL || "",
    flagFile: null,
    description: ele?.description || "",
    sectionExpanded: true,
    sections: ele?.sections
      ? ele.sections.map(sec => ({
        title: sec.title || "",
        description: sec.description || "",
        url: sec.url || "",
        _id: sec._id || undefined, // keep _id if needed
      }))
      : [{ title: "", description: "", url: "" }]
    ,
    eligiblity: ele?.eligibility || ["", "", "", "", "", "", ""],
    faq: ele?.faq || [{ question: "", answer: "" }],
  });
  const [uploads, setUploads] = useState({
    banner: { progress: 0, preview: null, name: "", loading: false },
    flag: { progress: 0, preview: null, name: "", loading: false },
    thumbnail: { progress: 0, preview: null, name: "", loading: false },
  });  

  const [errors, setErrors] = useState({});

  const [sectionFiles, setSectionFiles] = useState(() => {
    if (ele?.sections != null) {
      return Array.from({ length: ele.sections.length }, () => null);
    }
    return [null];
  });

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    if (type === "file") return;

    if (name.includes("sections") || name.includes("faq")) {
      const [sectionOrFaq, indexStr, field] = name.split(".");
      const index = parseInt(indexStr, 10);
      setForm((prev) => {
        const updatedArray = [...prev[sectionOrFaq]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prev, [sectionOrFaq]: updatedArray };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUploads((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress: 100,
        preview: previewURL,
        name: file.name,
        loading: false,
      },
    }));

    if (type === "banner") {
      setForm((prev) => ({
        ...prev,
        bannerFile: file,
        bannerURL: prev.bannerURL,
      }));
      setErrors((prev) => ({ ...prev, bannerURL: undefined }));
    } else if (type === "flag") {
      setForm((prev) => ({
        ...prev,
        flagFile: file,
        flagURL: prev.flagURL,
      }));
      setErrors((prev) => ({ ...prev, flagURL: undefined }));
    }

    toast.success(`${type} image will be sent with the form`);
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
    setErrors((prev) => ({ ...prev, [`sections.${index}.url`]: undefined }));
    toast.success(`Section ${index + 1} image will be sent with the form`);
  };


  console.log(form, "form+++++++++++++++++++++--------------");

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  const handleDescriptionChange = (index, value) => {
    setForm((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], description: value };
      return { ...prev, sections: next };
    });
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
      sections: [...prevValues.sections, { title: "", description: "", url: "" }],
    }));
    setSectionPreviews((prev) => [...prev, ""]);
    setSectionFiles((prev) => [...prev, null]);
  };

  const removeSection = (index) => {
    setForm((prevValues) => ({
      ...prevValues,
      sections: prevValues.sections.filter((_, i) => i !== index),
    }));
    setSectionPreviews((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors.");
      return;
    }

    const formData = mbbsFormToFormData(form, sectionFiles);

    try {
      if (ele && ele._id) {
        const res = await dispatch(
          updateAbroadStudy({ id: ele._id, data: formData })
        );
        if (updateAbroadStudy.fulfilled.match(res)) {
          toast.success("✅ Country updated successfully!");
          loadAbroadStudy?.();
          handleClose();
        } else if (updateAbroadStudy.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update country: " + errorMsg);
        }
      } else {
        const res = await dispatch(createMbbstudyThunk(formData));
        if (createMbbstudyThunk.fulfilled.match(res)) {
          toast.success("✅ Country created successfully!");
          loadAbroadStudy();
          handleClose();
        } else if (createMbbstudyThunk.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to create country: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to save country:", error);
      toast.error("Failed to save country");
    }
  };
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
              <img
                src={getAssetUrl(uploads.banner.preview || form.bannerURL)}
                alt="Banner"
                className="mt-2 img-fluid rounded"
              />
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
              <img
                src={getAssetUrl(uploads.flag.preview || form.flagURL)}
                alt="Flag"
                className="mt-2 rounded-circle"
                width="100"
              />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Bullet Point</Form.Label>
            <Form.Control type="text" name="bullet" value={form.bullet} onChange={handleChange} />
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
                      setContent={(value) => { handleDescriptionChange(index, value) }}
                    // onChange={handleChange}
                    />
                    {/* {section?.description } */}
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
                      <img
                        src={getAssetUrl(sectionPreviews[index] || section.url)}
                        alt="Section"
                        className="mt-2 img-fluid rounded"
                      />
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
