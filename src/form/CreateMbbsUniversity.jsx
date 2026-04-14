import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
  Accordion,
} from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "./TextEditor";
import { creatembbsUniversity, updateMbbsUniversity } from "../slice/mbbsUniversity";
import { fetchMbbsStudy } from "../slice/MbbsSlice";

function sectionUrlForUniversityPayload(sec, index, sectionFiles) {
  if (sectionFiles[index]) return "";
  const u = sec.url ?? "";
  if (typeof u === "string" && u.startsWith("data:")) return "";
  return u;
}

function mbbsUniversityFormToFormData(form, sectionFiles = []) {
  const fd = new FormData();
  fd.append("name", form.name ?? "");
  fd.append("description", form.description ?? "");
  fd.append("MCI", String(!!form.MCI));
  fd.append("ECFMG", String(!!form.ECFMG));
  fd.append("WHO", String(!!form.WHO));
  fd.append("NMC", String(!!form.NMC));
  fd.append("grade", form.grade ?? "");
  fd.append("rating", String(form.rating ?? ""));
  fd.append("campusLife", form.campusLife ?? "");
  fd.append("hostel", form.hostel ?? "");
  fd.append("type", form.type ?? "");
  fd.append("rank", String(form.rank ?? 0));
  fd.append("UniLink", form.UniLink ?? "");

  if (form.Country?._id) {
    fd.append("Country", form.Country._id);
  }

  const sectionsPayload = (form.sections ?? []).map((sec, i) => {
    const row = {
      title: sec.title ?? "",
      description: sec.description ?? "",
      url: sectionUrlForUniversityPayload(sec, i, sectionFiles),
    };
    if (sec._id) row._id = sec._id;
    return row;
  });
  fd.append("sections", JSON.stringify(sectionsPayload));

  sectionFiles.forEach((file, i) => {
    if (file) fd.append(`sectionUrl_${i}`, file, file.name);
  });

  if (form.bannerFile) {
    fd.append("bannerURL", form.bannerFile, form.bannerFile.name);
  } else if (String(form.bannerURL || "").trim() !== "") {
    fd.append("bannerURL", String(form.bannerURL).trim());
  }

  if (form.heroFile) {
    fd.append("heroURL", form.heroFile, form.heroFile.name);
  } else if (String(form.heroURL || "").trim() !== "") {
    fd.append("heroURL", String(form.heroURL).trim());
  }

  if (form.logoFile) {
    fd.append("logo", form.logoFile, form.logoFile.name);
  } else if (String(form.logo || "").trim() !== "") {
    fd.append("logo", String(form.logo).trim());
  }

  return fd;
}

const CreateMbbsUniversity = ({ ele, handleClose, loadUniversity }) => {
  const { studyMbbs } = useSelector((state) => state.mbbsStudy);
  const [sectionPreviews, setSectionPreviews] = useState([]);

  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: ele?.name || "",
    bannerURL: ele?.bannerURL || "",
    bannerFile: null,
    heroURL: ele?.heroURL || "",
    heroFile: null,
    description: ele?.description || "",
    MCI: ele?.MCI || "",
    ECFMG: ele?.ECFMG || "",
    WHO: ele?.WHO || "",
    NMC: ele?.NMC || "",
    grade: ele?.grade || "A",
    rating: ele?.rating || "5",
    sections: ele?.sections || [{ title: "", description: "", url: "" }],
    logo: ele?.logo || "",
    logoFile: null,
    campusLife: ele?.campusLife || "",
    hostel: ele?.hostel || "",
    type: ele?.type || "",
    rank: ele?.rank || 0,
    UniLink: ele?.UniLink || "",
    Country: ele?.Country || null,
  });

  const [sectionFiles, setSectionFiles] = useState(() => {
    if (ele?.sections != null) {
      return Array.from({ length: ele.sections.length }, () => null);
    }
    return [null];
  });

  const [bannerPreview, setBannerPreview] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [errors, setErrors] = useState({});

  const handleContentChange = (e, name) => {
    setForm((prev) => ({ ...prev, [name]: e }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const handleContentChangeSection = (index, value) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map((sec, i) => i === index ? { ...sec, description: value } : sec)
    }));
    setErrors(prev => ({ ...prev, description: "" }));
  };

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    if (type === "file") return;

    if (name.startsWith("section-")) {
      const [, index, field] = name.split("-");
      setForm((prev) => {
        const newSections = [...prev.sections];
        newSections[parseInt(index, 10)] = {
          ...newSections[parseInt(index, 10)],
          [field]: value,
        };
        return { ...prev, sections: newSections };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      bannerFile: file,
      bannerURL: prev.bannerURL,
    }));
    setErrors((prev) => ({ ...prev, bannerURL: undefined }));
  };

  const handleHeroFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroPreview(URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      heroFile: file,
      heroURL: prev.heroURL,
    }));
    setErrors((prev) => ({ ...prev, heroURL: undefined }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logo: prev.logo,
    }));
    setErrors((prev) => ({ ...prev, logo: undefined }));
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

  const handleSubmit = async () => {
    const formData = mbbsUniversityFormToFormData(form, sectionFiles);
    try {
      if (ele && ele._id) {
        const res = await dispatch(
          updateMbbsUniversity({ id: ele._id, data: formData })
        );
        if (updateMbbsUniversity.fulfilled.match(res)) {
          toast.success("✅ University updated successfully!");
          loadUniversity();
          handleClose();
        } else if (updateMbbsUniversity.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update university: " + errorMsg);
        }
      } else {
        const res = await dispatch(creatembbsUniversity(formData));
        if (creatembbsUniversity.fulfilled.match(res)) {
          toast.success("✅ University created successfully!");
          loadUniversity();
          handleClose();
        } else if (creatembbsUniversity.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to create university: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to save university:", error);
      toast.error("Failed to save university");
    }
  };

  useEffect(() => {
    const data = async () => {
      await dispatch(fetchMbbsStudy())
    }
    data()
  }, [])
  return (
    <Modal show onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="text-black">
        <Modal.Title>Add University</Modal.Title>
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
            <Form.Label>Banner Image</Form.Label>
            <Form.Control
              type="file"
              name="bannerURL"
              accept="image/*"
              onChange={handleBannerFileChange}
              isInvalid={!!errors.bannerURL}
            />
            {(bannerPreview || form.bannerURL) && (
              <img
                src={`https://backend.searchmystudy.com/${bannerPreview || form.bannerURL}`}
                alt="Banner"
                className="mt-2 img-fluid rounded"
              />
            )}
            <p className="text-muted text-sm color-red-500">Image should be w-2400px h-700px</p>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label> Image</Form.Label>
            <Form.Control
              type="file"
              name="heroURL"
              accept="image/*"
              onChange={handleHeroFileChange}
              isInvalid={!!errors.heroURL}
            />
            <p className="text-muted text-sm color-red-500">Image should be w-400px h-300px</p>
            {(heroPreview || form.heroURL) && (
              <img
                src={`https://backend.searchmystudy.com/${heroPreview || form.heroURL}`}
                alt="Hero"
                className="mt-2 rounded-circle"
                width="100"
              />
            )}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleLogoFileChange}
              isInvalid={!!errors.logo}
            />
            {(logoPreview || form.logo) && (
              <img
                src={`https://backend.searchmystudy.com/${logoPreview || form.logo}`}
                alt="Logo"
                className="mt-2 rounded-circle"
                width="100"
              />
            )}
            <p className="text-muted text-sm color-red-500">Image should be w-150px h-150px</p>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <TextEditor name="description" content={form.description} setContent={(e) => { handleContentChange(e, "description") }} />
          </Form.Group>

         <div className="mt-3 p-3 border rounded bg-light">
  <Form.Label className="fw-bold d-block mb-2">
    University Approval
  </Form.Label>
  <div className="d-flex flex-wrap gap-4">
    <Form.Check
      type="checkbox"
      label="MCI Approved"
      name="MCI"
      checked={!!form.MCI}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, MCI: e.target.checked }))
      }
      className="me-4"
    />
    <Form.Check
      type="checkbox"
      label="ECFMG Approved"
      name="ECFMG"
      checked={!!form.ECFMG}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, ECFMG: e.target.checked }))
      }
      className="me-4"
    />
    <Form.Check
      type="checkbox"
      label="WHO Approved"
      name="WHO"
      checked={!!form.WHO}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, WHO: e.target.checked }))
      }
      className="me-4"
    />
    <Form.Check
      type="checkbox"
      label="NMC Approved"
      name="NMC"
      checked={!!form.NMC}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, NMC: e.target.checked }))
      }
    />
  </div>
</div>


          {/* Sections */}
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
                    <TextEditor content={section.description} setContent={(val) => handleContentChangeSection(index, val)} />
                  </Form.Group>

                  <Form.Group className="mt-2">
                    <Form.Label>Section Image</Form.Label>
                    <Form.Control
                      type="file"
                      name={`sectionUrl_${index}`}
                      accept="image/*"
                      onChange={(e) => handleSectionFileChange(e, index)}
                    />
                    {(sectionPreviews[index] || section.url) && (
                      <img
                        src={`https://backend.searchmystudy.com/${sectionPreviews[index] || section.url}`}  
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
          <Form.Group className="mt-3">
            <Form.Label>Country</Form.Label>
            <Form.Select
              name="Country"
              value={form?.Country?._id || ""}
              onChange={async (e) => {
                const selectedCountryId = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  Country:
                    studyMbbs.find((c) => c._id === selectedCountryId) || prev.Country,
                }));
                setErrors((prev) => ({ ...prev, Country: "" }));
              }}
              isInvalid={!!errors.Country}
            >
              <option value="" disabled>
                {form?.Country?.name || "Select"}
              </option>
              {studyMbbs?.map((country) => (
                <option key={country._id} value={country._id}>
                  {country?.name}
                </option>
              ))}
            </Form.Select>

            {errors.Country && (
              <Form.Control.Feedback type="invalid">
                {errors.Country}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {/* <Form.Group className="mt-3">
            <Form.Label>Province</Form.Label>
            <Form.Select name="Province" value={form.Province?._id || ""} onChange={handleChange}>
              <option value="">Select Province</option>
              {province?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Form.Select>
          </Form.Group> */}


          {/* <Form.Group className="mt-3">
            <Form.Label>Province</Form.Label>
            <Form.Select
              name="Province"
              value={ele?.Province?._id || form?.Province?._id || ""}
              onChange={handleChange}
              isInvalid={!!errors.Province}
            >
              <option value="" disabled>
                {ele?.Province?.name || "Select"}
              </option>
              {abroadProvince?.map((province) => {
                console.log(province, "(((((((((((");

                return (
                  <option key={province._id} value={province._id}>
                    {province?.name}
                  </option>
                )
              })}
            </Form.Select>
            {errors.Province && (
              <Form.Control.Feedback type="invalid">
                {errors.Province}
              </Form.Control.Feedback>
            )}
          </Form.Group> */}



          {/* <Form.Group>
            <Form.Label>Campus Life</Form.Label>
            <Form.Control
              type="text"
              name="campusLife"
              value={form.campusLife}
              onChange={handleChange}
              isInvalid={!!errors.campusLife}
            />
            <Form.Control.Feedback type="invalid">{errors.campusLife}</Form.Control.Feedback>
          </Form.Group> */}

          <Form.Group className="mt-3">
            <Form.Label>Campus Life</Form.Label>
            <TextEditor name="campusLife" content={form.campusLife} setContent={(e) => { handleContentChange(e, "campusLife") }} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Hostel Life</Form.Label>
            <TextEditor name="hostel" content={form.hostel} setContent={(e) => { handleContentChange(e, "hostel") }} />
          </Form.Group>

          {/* <Form.Group>
            <Form.Label>Hostel</Form.Label>
            <Form.Control
              type="text"
              name="hostel"
              value={form.hostel}
              onChange={handleChange}
              isInvalid={!!errors.hostel}
            />
            <Form.Control.Feedback type="invalid">{errors.hostel}</Form.Control.Feedback>
          </Form.Group> */}

          <Form.Group>
            <Form.Label>University Type</Form.Label>
            {/* <Form.Control
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              isInvalid={!!errors.type}
            />
            <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback> */}

            <Form.Select
              name="type"
              value={form?.type || ""}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value || prev.type,
                }));
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              isInvalid={!!errors.type}
            >
              <option value="" disabled>
                {form?.type || "Select"}
              </option>
              <option value="public">
                Public
              </option>
              <option value="private">
                Private
              </option>

            </Form.Select>

            {errors.Country && (
              <Form.Control.Feedback type="invalid">
                {errors.Country}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label>Rank</Form.Label>
            <Form.Control
              type="number"
              name="rank"
              max="5"
              value={form.rank}
              onChange={e => {
                const value = Math.min(Number(e.target.value), 5);
                setForm(prev => ({ ...prev, rank: value }));
                setErrors(prev => ({ ...prev, rank: "" }));
              }}
              isInvalid={!!errors.rank}
            />
            <Form.Control.Feedback type="invalid">{errors.rank}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>University Link</Form.Label>
            <Form.Control
              type="text"
              name="UniLink"
              value={form.UniLink}
              onChange={handleChange}
              isInvalid={!!errors.UniLink}
            />
            <Form.Control.Feedback type="invalid">{errors.UniLink}</Form.Control.Feedback>
          </Form.Group>

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {ele && ele._id ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateMbbsUniversity;