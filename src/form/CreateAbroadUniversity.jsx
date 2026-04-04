import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Button, Form, Accordion } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "./TextEditor";
import { createAbroadUniversity, updateAbroadUniversity } from "../slice/AbroadUniversitySlice";
import { fetchAbroadStudy } from "../slice/AbroadSlice";
import { getAllProvincesByCountryId } from "../slice/AbroadProvinceSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
};

const normalizeCountryId = (country) => {
  if (!country) return "";
  if (typeof country === "string") return country;
  return country._id || country.id || "";
};

const normalizeProvinceIds = (provinceValue) => {
  if (!provinceValue) return [];
  const raw = Array.isArray(provinceValue) ? provinceValue : [provinceValue];
  return raw
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item._id || item.id || "";
    })
    .filter(Boolean);
};

const universityFormToFormData = (form, sectionFiles = []) => {
  const fd = new FormData();
  fd.append("name", form.name ?? "");
  fd.append("description", form.description ?? "");
  fd.append("campusLife", form.campusLife ?? "");
  fd.append("hostel", form.hostel ?? "");
  fd.append("type", form.type ?? "");
  fd.append("rank", String(form.rank ?? 0));
  fd.append("UniLink", form.UniLink ?? "");
  fd.append("Country", form.Country ?? "");

  (form.Province ?? []).forEach((id) => {
    if (id) fd.append("Province", id);
  });

  const sectionsPayload = (form.sections ?? []).map((section, index) => {
    const row = {
      title: section.title ?? "",
      description: section.description ?? "",
      url: sectionFiles[index] ? "" : section.url ?? "",
    };
    if (section._id) row._id = section._id;
    return row;
  });
  fd.append("sections", JSON.stringify(sectionsPayload));

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

  if (form.logoFile) {
    fd.append("logo", form.logoFile, form.logoFile.name);
  } else if (String(form.logo || "").trim()) {
    fd.append("logo", String(form.logo).trim());
  }

  sectionFiles.forEach((file) => {
    if (file) fd.append("sectionUrl", file, file.name);
  });

  return fd;
};

const CreateAbroadUniversity = ({ ele, handleClose, loadUniversity }) => {
  const dispatch = useDispatch();
  const [studyAbroad, setStudyAbroad] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL: ele?.bannerURL || "",
    bannerFile: null,
    heroURL: ele?.heroURL || "",
    heroFile: null,
    Province: normalizeProvinceIds(ele?.Province),
    description: ele?.description || "",
    sections: ele?.sections || [{ title: "", description: "", url: "" }],
    logo: ele?.logo || "",
    logoFile: null,
    campusLife: ele?.campusLife || "",
    hostel: ele?.hostel || "",
    type: ele?.type || "",
    rank: ele?.rank || 0,
    UniLink: ele?.UniLink || "",
    Country: normalizeCountryId(ele?.Country),
  });

  const [sectionPreviews, setSectionPreviews] = useState(
    ele?.sections?.map((section) => section.url || "") || [""]
  );
  const [sectionFiles, setSectionFiles] = useState(
    ele?.sections?.map(() => null) || [null]
  );
  const [bannerPreview, setBannerPreview] = useState(ele?.bannerURL || "");
  const [heroPreview, setHeroPreview] = useState(ele?.heroURL || "");
  const [logoPreview, setLogoPreview] = useState(ele?.logo || "");
  const [errors, setErrors] = useState({});

  const loadProvinces = async (countryId) => {
    if (!countryId) {
      setProvinceOptions([]);
      return;
    }
    const res = await dispatch(getAllProvincesByCountryId(countryId));
    if (getAllProvincesByCountryId.fulfilled.match(res)) {
      setProvinceOptions(res.payload || []);
    } else {
      setProvinceOptions([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const res = await dispatch(fetchAbroadStudy());
      setStudyAbroad(res?.payload || []);
      if (normalizeCountryId(ele?.Country)) {
        await loadProvinces(normalizeCountryId(ele?.Country));
      }
    };
    loadInitialData();
  }, [dispatch, ele]);

  const handleContentChange = (value, field) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleContentChangeSection = (index, value) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, i) =>
        i === index ? { ...sec, description: value } : sec
      ),
    }));
  };

  const handleChange = async (event) => {
    const { name, value, type } = event.target;
    if (type === "file") return;

    if (name.startsWith("section-")) {
      const [, index, field] = name.split("-");
      setForm((prev) => {
        const nextSections = [...prev.sections];
        nextSections[parseInt(index, 10)] = {
          ...nextSections[parseInt(index, 10)],
          [field]: value,
        };
        return { ...prev, sections: nextSections };
      });
      return;
    }

    if (name === "Country") {
      setForm((prev) => ({ ...prev, Country: value, Province: [] }));
      await loadProvinces(value);
      return;
    }

    if (name === "Province") {
      setForm((prev) => ({ ...prev, Province: value ? [value] : [] }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    if (field === "bannerURL") {
      setBannerPreview(preview);
      setForm((prev) => ({ ...prev, bannerFile: file }));
    } else if (field === "heroURL") {
      setHeroPreview(preview);
      setForm((prev) => ({ ...prev, heroFile: file }));
    } else if (field === "logo") {
      setLogoPreview(preview);
      setForm((prev) => ({ ...prev, logoFile: file }));
    }
  };

  const handleSectionFileChange = (e, index) => {
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

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", description: "", url: "" }],
    }));
    setSectionPreviews((prev) => [...prev, ""]);
    setSectionFiles((prev) => [...prev, null]);
  };

  const removeSection = (index) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    setSectionPreviews((prev) => prev.filter((_, i) => i !== index));
    setSectionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const formData = universityFormToFormData(form, sectionFiles);
      const action = ele?._id
        ? updateAbroadUniversity({ id: ele._id, data: formData })
        : createAbroadUniversity(formData);
      const res = await dispatch(action);
      console.log(res,"--------------------");
      if (
        createAbroadUniversity.fulfilled.match(res) ||
        updateAbroadUniversity.fulfilled.match(res)
      ) {
        toast.success(`✅ University ${ele?._id ? "updated" : "created"} successfully!`);
        loadUniversity();
        handleClose();
      } else {
        const errorMsg =
          res.payload?.message || res.error?.message || "Unknown error occurred.";
        toast.error(`❌ Failed to save university: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Failed to save university:", error);
      toast.error("Failed to save university");
    }
  };

  return (
    <Modal show onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="text-black">
        <Modal.Title>{ele?._id ? "Update University" : "Add University"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={form.name} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Banner Image</Form.Label>
            <Form.Control type="file" name="bannerURL" accept="image/*" onChange={(e) => handleFileChange(e, "bannerURL")} />
            {(bannerPreview || form.bannerURL) && (
              <img src={getAssetUrl(bannerPreview || form.bannerURL)} alt="Banner" className="mt-2 img-fluid rounded" />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" name="heroURL" accept="image/*" onChange={(e) => handleFileChange(e, "heroURL")} />
            {(heroPreview || form.heroURL) && (
              <img src={getAssetUrl(heroPreview || form.heroURL)} alt="Hero" className="mt-2 rounded-circle" width="100" />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control type="file" name="logo" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
            {(logoPreview || form.logo) && (
              <img src={getAssetUrl(logoPreview || form.logo)} alt="Logo" className="mt-2 rounded-circle" width="100" />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor content={form.description} setContent={(value) => handleContentChange(value, "description")} />
          </Form.Group>

          <Accordion className="mt-4">
            {form.sections.map((section, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>Section {index + 1}</Accordion.Header>
                <Accordion.Body>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" name={`section-${index}-title`} value={section.title} onChange={handleChange} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Description</Form.Label>
                    <TextEditor content={section.description} setContent={(value) => handleContentChangeSection(index, value)} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Section Image</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={(e) => handleSectionFileChange(e, index)} />
                    {sectionPreviews[index] && (
                      <img src={getAssetUrl(sectionPreviews[index])} alt="Section" className="mt-2 img-fluid rounded" />
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

          <Form.Group className="mt-3">
            <Form.Label>Country</Form.Label>
            <Form.Select name="Country" value={form.Country || ""} onChange={handleChange}>
              <option value="">Select Country</option>
              {studyAbroad?.map((country) => (
                <option key={country._id} value={country._id}>
                  {country.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Province</Form.Label>
            <Form.Select name="Province" value={form.Province?.[0] || ""} onChange={handleChange}>
              <option value="">Select Province</option>
              {provinceOptions?.map((province) => (
                <option key={province._id} value={province._id}>
                  {province.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Campus Life</Form.Label>
            <TextEditor content={form.campusLife} setContent={(value) => handleContentChange(value, "campusLife")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Hostel</Form.Label>
            <TextEditor content={form.hostel} setContent={(value) => handleContentChange(value, "hostel")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>University Type</Form.Label>
            <Form.Control type="text" name="type" value={form.type} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Rank</Form.Label>
            <Form.Control type="number" name="rank" value={form.rank} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>University Link</Form.Label>
            <Form.Control type="text" name="UniLink" value={form.UniLink} onChange={handleChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {ele?._id ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
      <ToastContainer position="top-right" theme="colored" />
    </Modal>
  );
};

export default CreateAbroadUniversity;