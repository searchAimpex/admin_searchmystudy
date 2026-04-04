import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Form, Accordion } from 'react-bootstrap';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "./TextEditor";
import { createAbroadProvince, updateAbroadProvince } from "../slice/AbroadProvinceSlice.js";
import { fetchAbroadStudy } from "../slice/AbroadSlice.js";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
};

const provinceFormToFormData = (form, sectionFiles = []) => {
  const fd = new FormData();
  fd.append("name", form.name ?? "");
  fd.append("description", form.description ?? "");
  fd.append("Country", form.Country ?? "");

  const sectionsForApi = (form.sections ?? []).map((section, index) => {
    const row = {
      title: section.title ?? "",
      description: section.description ?? "",
      url: sectionFiles[index] ? "" : section.url ?? "",
    };
    if (section._id) row._id = section._id;
    return row;
  });
  fd.append("sections", JSON.stringify(sectionsForApi));

  if (form.bannerFile) {
    fd.append("bannerURL", form.bannerFile, form.bannerFile.name);
  } else if (String(form.bannerURL || "").trim()) {
    fd.append("bannerURL", String(form.bannerURL).trim());
  }

  if (form.heroFile) {
    fd.append("heroURL", form.heroFile, form.heroFile.name);
  } else if (String(form.heroURL || "").trim()) {
    fd.append("heroURL", String(form.heroURL).trim());
  }

  sectionFiles.forEach((file) => {
    if (file) fd.append("sectionUrl", file, file.name);
  });

  return fd;
};

const CreateAbroadProvince = ({ ele, handleClose, loadProvince }) => {
  const dispatch = useDispatch();
  const { studyAbroad } = useSelector((state) => state.abroadStudy);

  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL: ele?.bannerURL || "",
    bannerFile: null,
    heroURL: ele?.heroURL || "",
    heroFile: null,
    description: ele?.description || "",
    sections: ele?.sections || [{ title: "", description: "", url: "" }],
    Country: ele?.Country?._id || ele?.Country || "",
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
  const [sectionFiles, setSectionFiles] = useState(
    ele?.sections?.map(() => null) || [null]
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") return;
    if (name.startsWith("section-")) {
      const [_, index, field] = name.split("-");
      setForm(prev => {
        const newSections = [...prev.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        return { ...prev, sections: newSections };
      });
    }
    else if (name === "Country") {
      setForm(prev => ({ ...prev, Country: value }));
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    if (field === "bannerURL") {
      setBannerPreview(preview);
      setForm((prev) => ({ ...prev, bannerFile: file }));
    } else if (field === "heroURL") {
      setHeroPreview(preview);
      setForm((prev) => ({ ...prev, heroFile: file }));
    }
  };

  const handleSectionImageChange = (e, index) => {
    const file = e.target.files?.[0];
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
    setSectionFiles(prev => [...prev, null]);
  };

  const removeSection = (index) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    setSectionPreviews(prev => prev.filter((_, i) => i !== index));
    setSectionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const hasBanner = Boolean(form.bannerFile || form.bannerURL);
      const hasHero = Boolean(form.heroFile || form.heroURL);

      if (!form.name || !hasBanner || !hasHero || !form.description || !form.Country) {
        toast.error("Please fill all required fields!");
        return;
      }

      const formData = provinceFormToFormData(form, sectionFiles);

      if (ele && ele._id) {
        const res = await dispatch(updateAbroadProvince({ id: ele._id, data: formData }));
        if (updateAbroadProvince.fulfilled.match(res)) {
          toast.success("✅ Province updated successfully!");
          handleClose();
          loadProvince();
        } else {
          toast.error(res.payload?.message || "Failed to update province");
        }
      } else {
        const res = await dispatch(createAbroadProvince(formData));
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
            <Form.Control type="text" name="name" value={form.name} onChange={handleChange} />
          </Form.Group>

          {/* Banner */}
          <Form.Group className="mt-3">
            <Form.Label>Banner Image</Form.Label>
            <Form.Control type="file" name="bannerURL" onChange={(e) => handleImageChange(e, "bannerURL")} />
            {bannerPreview && <img src={getAssetUrl(bannerPreview)} alt="Banner" width="200" className="mt-2" />}
          </Form.Group>

          {/* Hero */}
          <Form.Group className="mt-3">
            <Form.Label>Hero Image</Form.Label>
            <Form.Control type="file" name="heroURL" onChange={(e) => handleImageChange(e, "heroURL")} />
            {heroPreview && <img src={getAssetUrl(heroPreview)} alt="Hero" width="100" className="mt-2 rounded-circle" />}
          </Form.Group>

          {/* Description */}
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor content={form.description} setContent={handleContentChange} />
          </Form.Group>

          {/* Sections */}
          <Accordion className="mt-3">
            {form.sections.map((section, idx) => (
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
                    <Form.Control type="file" name={`section-${idx}-url`} onChange={(e) => handleSectionImageChange(e, idx)} />
                    {sectionPreviews[idx] && <img src={getAssetUrl(sectionPreviews[idx])} alt="Section" width="150" className="mt-2" />}
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
            <Form.Select name="Country" value={form.Country || ""} onChange={handleChange}>
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
