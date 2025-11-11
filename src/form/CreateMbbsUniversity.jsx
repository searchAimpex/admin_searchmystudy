import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "./TextEditor";
import { creatembbsUniversity, updateMbbsUniversity } from "../slice/mbbsUniversity";
import { fetchMbbsStudy } from "../slice/MbbsSlice";


const CreateMbbsUniversity = ({ ele, handleClose, loadUniversity }) => {
  const storage = getStorage(app);
  const { studyMbbs } = useSelector((state) => state.mbbsStudy)
  const [sectionPreviews, setSectionPreviews] = useState([]);

  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: ele?.name || '',
    bannerURL: ele?.bannerURL || '',
    heroURL: ele?.heroURL || '',
    description: ele?.description || '',
    MCI: ele?.MCI || '',
    ECFMG: ele?.ECFMG || '',
    WHO: ele?.WHO || '',
    NMC: ele?.NMC || '',
    grade: ele?.grade || 'A',
    rating: ele?.rating || '5',
    sections: ele?.sections || [{ title: '', description: '', url: '' }],
    logo: ele?.logo || '',
    campusLife: ele?.campusLife || '',
    hostel: ele?.hostel || '',
    type: ele?.type || '',
    rank: ele?.rank || 0,
    UniLink: ele?.UniLink || '',
    Country: ele?.Country || null,
  })

  const [bannerPreview, setBannerPreview] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [errors, setErrors] = useState({});

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `provinces/${Date.now()}-${file.name}`);
    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleContentChange = (e, name) => {
    console.log(e);

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

  const handleChange = async (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        try {
          if (name === 'bannerURL') {
            // await validateImageDimensions(file, { width: 1500, height: 500 });
            const previewURL = URL.createObjectURL(file);
            setBannerPreview(previewURL);
            const imageURL = await uploadImage(file);
            setForm(prev => ({ ...prev, bannerURL: imageURL }));
          }
          else if (name === 'heroURL') {
            // await validateImageDimensions(file, { width: 350, height: 400 });
            const previewURL = URL.createObjectURL(file);
            setHeroPreview(previewURL);
            const imageURL = await uploadImage(file);
            setForm(prev => ({ ...prev, heroURL: imageURL }));
          }
          else if (name === 'logo') {
            // await validateImageDimensions(file, { width: 350, height: 400 });
            const previewURL = URL.createObjectURL(file);
            setLogoPreview(previewURL);
            const imageURL = await uploadImage(file);
            setForm(prev => ({ ...prev, logo: imageURL }));
          }
          else if (name.startsWith('sectionImage')) {
            const sectionIndex = parseInt(name.split('-')[1]);
            const previewURL = URL.createObjectURL(file);
            setSectionPreviews(prev => {
              const newPreviews = [...prev];
              newPreviews[sectionIndex] = previewURL;
              return newPreviews;
            });
            const imageURL = await uploadImage(file);
            setForm(prev => {
              const newSections = [...prev.sections];
              newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                url: imageURL
              };
              return { ...prev, sections: newSections };
            });
          }
        } catch (error) {
          toast.error(error.message);
        }
      }
    } else if (name.startsWith('section-')) {
      const [, index, field] = name.split('-');
      setForm(prev => {
        const newSections = [...prev.sections];
        newSections[parseInt(index)] = {
          ...newSections[parseInt(index)],
          [field]: value
        };
        return { ...prev, sections: newSections };
      });
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));

    }
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

  const handleSubmit = async () => {
    try {
      if (ele && ele._id) {
        // Update existing country


        const res = await dispatch(updateMbbsUniversity({ id: ele._id, data: form }));
        if (updateMbbsUniversity.fulfilled.match(res)) {
          toast.success("✅ University updated successfully!");
          loadUniversity()
          handleClose();
        }
        else if (updateMbbsUniversity.rejected.match(res)) {
          // Failure case with detailed error
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update university: " + errorMsg);
        }
      } else {
        // Create new University

        // console.log(form, "+++++++++++++++++++++-----------");
        const res = await dispatch(creatembbsUniversity(form));
        console.log(res,"------------------------------------------------------");
        
        if (creatembbsUniversity.fulfilled.match(res)) {
          toast.success("✅ University created successfully!");
          loadUniversity()
          handleClose();
        } else if (creatembbsUniversity.rejected.match(res)) {
          // Failure case with detailed error
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to create university: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to create Province:", error);
      toast.error("Failed to create Province");
    }
  }

  useEffect(() => {
    const data = async () => {
      await dispatch(fetchMbbsStudy())
    }
    data()
  }, [])
  return (
    <Modal show={open} onHide={handleClose} size="lg" centered scrollable>
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
              onChange={(e) => {
                handleChange(e, "banner")
              }}
              isInvalid={!!errors.bannerURL}
            />
            {ele?.bannerURL && <img src={ele?.bannerURL} alt="Banner" className="mt-2 img-fluid rounded" />}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label> Image</Form.Label>
            <Form.Control
              type="file"
              name="heroURL"
              onChange={(e) => {
                handleChange(e, "image")
              }}
              isInvalid={!!errors.heroURL}
            />
            {ele?.heroURL && <img src={ele?.heroURL} alt="Hero Image" className="mt-2 rounded-circle" width="100" />}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control
              type="file"
              name="logo"
              onChange={(e) => {
                handleChange(e, "logo")
              }}
              isInvalid={!!errors.logo}
            />
            {ele?.logo && <img src={ele?.logo} alt="logo" className="mt-2 rounded-circle" width="100" />}
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
                      name={`sections.${index}.url`}
                      onChange={handleChange}
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