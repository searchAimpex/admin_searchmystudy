import { useState } from "react";
import { useDispatch } from "react-redux";
import { createService, updateService } from "../slice/serviceSlice";
import { toast } from "react-toastify";

const CreateService = ({ ele, handleClose,loadServices }) => {
  const [form, setForm] = useState({
    title: ele?.title || '',
    banner: ele?.banner || '',
    heading: ele?.heading || '',
    card: {
      title: ele?.card?.title || '',
      cardImage: ele?.card?.cardImage ||  '',
      shortDescription: ele?.card?.shortDescription || '',
    },
    cardExpanded: false, // New state for card expansion
    sectionOne: {
      heroOne: ele?.sectionOne?.heroOne || '',
      content: ele?.sectionOne?.content || '',
    },
    sectionOneExpanded: false, // New state for section one expansion
    sectionTwo: {
      heroTwo: ele?.sectionTwo?.heroTwo || '',
      content: ele?.sectionTwo?.content || ''
    },
    sectionTwoExpanded: false, // New state for section two expansion
    sectionThree: {
      heroThree: ele?.sectionThree?.heroThree || '',
      content: ele?.sectionThree?.content || ''
    },
    sectionThreeExpanded: false, // New state for section three expansion
    elegiblity: {
      title: ele?.elegiblity?.title || '',
      pointerOne: ele?.elegiblity?.pointerOne || '',
      pointerTwo: ele?.elegiblity?.pointerTwo || '',
      pointerThree: ele?.elegiblity?.pointerThree || '',
      pointerFour: ele?.elegiblity?.pointerFour || '',
      pointerFive: ele?.elegiblity?.pointerFive || '',
      pointerSix: ele?.elegiblity?.pointerSix || '',
      pointerSeven: ele?.elegiblity?.pointerSeven || ''
    },
    elegiblityExpanded: false // New state for Elegibility expansion
  });

  const [errors, setErrors] = useState({}); // To store validation errors

  const dispatch = useDispatch();

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      [field]: file.name,
    }));

    // Clear error for this field when user selects a file
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, content: value }));
    setErrors((prev) => ({ ...prev, content: "" }));
  };

  const validateForm = () =>{
    const newErrors = {};

    if(!form.title.trim()) newErrors.title = "Title is required";
    if(!form.banner.trim()) newErrors.banner = "Banner is required";
    if(!form.heading.trim()) newErrors.heading = "Heading is required";
    if(!form.card.title.trim()) newErrors.card.title = "Card Title is required";
    if(!form.card.cardImage.trim()) newErrors.card.cardImage = "Card image is required";
    if(!form.card.shortDescription.trim()) newErrors.card.shortDescription = "Card description is required";

    setErrors(newErrors);

    // If no errors, return true
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {

      if (ele && ele._id) {
        // Update existing webinar
        const res = await dispatch(updateService({id:ele._id,data:form}));
        if (updateService.fulfilled.match(res)) {
          alert("Service updated successfully!");
          handleClose();
          loadServices()
        } else if (updateService.rejected.match(res)) {
          alert("Failed to update Service: " + (res.payload?.message || res.error.message || "Unknown error"));
        }
      } else {
        // Create new webinar
        const res = await dispatch(createService(form));
        if (createService.fulfilled.match(res)) {
          toast.success("Service created successfully!");
          loadServices()
          handleClose();
        } else if (createService.rejected.match(res)) {
          alert("Failed to create Service: " + (res.payload?.message || res.error.message || "Unknown error"));
        }
      }

      // console.log("Form Data:", form);
      // const res = await dispatch(createService(form));

      // if (createService.fulfilled.match(res)) {
      //   alert("Service created successfully!");
      //   // Optionally reset form or close modal here
      // } else if (createService.rejected.match(res)) {
      //   alert("Failed to create Service: " + (res.payload?.message || res.error.message || "Unknown error"));
      // }
    } catch (error) {
      alert("Unexpected error: " + error.message);
    }
  };
  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog" style={{ maxWidth: "800px" }}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add Service</h5>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </div>

        <div className="p-12">
          <div className="col-12">
            <label className="form-label">Title</label>
            <input
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              type="text"
              name="title"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              placeholder="Enter title here"
              value={form.title}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="col-12 mt-20">
            <label className="form-label">Upload banner</label>
            <input
              className={`form-control form-control-lg ${errors.banner ? "is-invalid" : ""}`}
              name="banner"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "banner")}
            />
            <p style={{ color: "red" }}>Banner Size should be 1200x600 px</p>
            {form.banner && <p>Selected file: {form.banner}</p>}
            {errors.banner && <div className="invalid-feedback">{errors.banner}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">Heading</label>
            <input
              onChange={(e) => {
                setForm((prev) => ({ ...prev, heading: e.target.value }));
                setErrors((prev) => ({ ...prev, heading: "" }));
              }}
              type="text"
              name="heading"
              className={`form-control ${errors.heading ? "is-invalid" : ""}`}
              placeholder="Enter title here"
              value={form.heading}
            />
            {errors.heading && <div className="invalid-feedback">{errors.heading}</div>}
          </div>

          {/* Card Section */}
          <div className="col-12 mt-20 border border-2 rounded">
            <div className="card">
              <div 
                className="card-header" 
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(prev => ({ ...prev, cardExpanded: !prev.cardExpanded }))}
              >
                <label className="form-label dropdown mb-0 d-flex align-items-center justify-content-between">
                  Card
                </label>
              </div>
              
              {form.cardExpanded && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Card Title</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, title: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, title: "" }
                          }));
                        }}
                        type="text"
                        name="cardTitle"
                        className={`form-control ${errors.card?.title ? "is-invalid" : ""}`}
                        placeholder="Enter card title here"
                        value={form.card.title}
                      />
                      {errors.card?.title && <div className="invalid-feedback">{errors.card.title}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Card Image</label>
                      <input
                        className={`form-control form-control-lg ${errors.card?.cardImage ? "is-invalid" : ""}`}
                        name="cardImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setForm((prev) => ({
                            ...prev,
                            card: { ...prev.card, cardImage: file.name }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, cardImage: "" }
                          }));
                        }}
                      />
                      <p style={{ color: "red" }}>Card Image Size should be 400x300 px</p>
                      {form.card.cardImage && <p>Selected file: {form.card.cardImage}</p>}
                      {errors.card?.cardImage && <div className="invalid-feedback">{errors.card.cardImage}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Card Short Description</label>
                      <textarea
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, shortDescription: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, shortDescription: "" }
                          }));
                        }}
                        name="cardShortDescription"
                        className={`form-control ${errors.card?.shortDescription ? "is-invalid" : ""}`}
                        placeholder="Enter card short description here"
                        value={form.card.shortDescription}
                        rows="3"
                      />
                      {errors.card?.shortDescription && <div className="invalid-feedback">{errors.card.shortDescription}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          

          {/* Section One */}

          <div className="col-12 mt-20 border border-2 rounded">
            <div className="card">
              <div 
                className="card-header" 
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(prev => ({ ...prev, sectionOneExpanded: !prev.sectionOneExpanded }))}
              >
                <label className="form-label dropdown mb-0 d-flex align-items-center justify-content-between">
                  Section One
                </label>
              </div>
              
              {form.sectionOneExpanded && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Image</label>
                      <input
                        className={`form-control form-control-lg ${errors.sectionOne?.heroOne ? "is-invalid" : ""}`}
                        name="heroOne"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setForm((prev) => ({
                            ...prev,
                            sectionOne: { ...prev.sectionOne, heroOne: file.name }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            card: { ...prev.card, cardImage: "" }
                          }));
                        }}
                      />
                      <p style={{ color: "red" }}>Card Image Size should be 400x300 px</p>
                      {form.sectionOne.heroOne && <p>Selected file: {form.sectionOne.heroOne}</p>}
                      {errors.sectionOne?.heroOne && <div className="invalid-feedback">{errors.sectionOne.heroOne}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Content</label>
                      <textarea
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            sectionOne: { ...prev.sectionOne, content: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            sectionOne: { ...prev.sectionOne, content: "" }
                          }));
                        }}
                        name="content"
                        className={`form-control ${errors.card?.shortDescription ? "is-invalid" : ""}`}
                        placeholder="Enter content here"
                        value={form.sectionOne.content}
                        rows="3"
                      />
                      {errors.sectionOne?.content && <div className="invalid-feedback">{errors.sectionOne.content}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Two  */}

          <div className="col-12 mt-20 border border-2 rounded">
            <div className="card">
              <div 
                className="card-header" 
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(prev => ({ ...prev, sectionTwoExpanded: !prev.sectionTwoExpanded }))}
              >
                <label className="form-label dropdown mb-0 d-flex align-items-center justify-content-between">
                  Section Two
                </label>
              </div>
              
              {form.sectionTwoExpanded && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Image</label>
                      <input
                        className={`form-control form-control-lg ${errors.sectionTwo?.heroTwo ? "is-invalid" : ""}`}
                        name="heroTwo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setForm((prev) => ({
                            ...prev,
                            sectionTwo: { ...prev.sectionTwo, heroTwo: file.name }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            sectionTwo: { ...prev.sectionTwo, heroTwo: "" }
                          }));
                        }}
                      />
                      <p style={{ color: "red" }}>Card Image Size should be 400x300 px</p>
                      {form.sectionTwo.heroTwo && <p>Selected file: {form.sectionTwo.heroTwo}</p>}
                      {errors.sectionTwo?.heroTwo && <div className="invalid-feedback">{errors.sectionTwo.heroTwo}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Content</label>
                      <textarea
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            sectionTwo: { ...prev.sectionTwo, content: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            sectionTwo: { ...prev.heroTwo, content: "" }
                          }));
                        }}
                        name="content"
                        className={`form-control ${errors.sectionTwo?.content ? "is-invalid" : ""}`}
                        placeholder="Enter content here"
                        value={form.sectionTwo.content}
                        rows="3"
                      />
                      {errors.sectionTwo?.content && <div className="invalid-feedback">{errors.sectionTwo.content}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Three */}
          <div className="col-12 mt-20 border border-2 rounded">
            <div className="card">
              <div 
                className="card-header" 
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(prev => ({ ...prev, sectionThreeExpanded: !prev.sectionThreeExpanded }))}
              >
                <label className="form-label dropdown mb-0 d-flex align-items-center justify-content-between">
                  Section Three
                </label>
              </div>
              
              {form.sectionThreeExpanded && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Image</label>
                      <input
                        className={`form-control form-control-lg ${errors.sectionThree?.heroThree ? "is-invalid" : ""}`}
                        name="heroThree"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setForm((prev) => ({
                            ...prev,
                            sectionThree: { ...prev.sectionThree, heroThree: file.name }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            sectionThree: { ...prev.sectionThree, heroThree: "" }
                          }));
                        }}
                      />
                      <p style={{ color: "red" }}>Card Image Size should be 400x300 px</p>
                      {form.sectionThree.heroThree && <p>Selected file: {form.sectionThree.heroThree}</p>}
                      {errors.sectionThree?.heroThree && <div className="invalid-feedback">{errors.sectionThree.heroThree}</div>}
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Content</label>
                      <textarea
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            sectionThree: { ...prev.sectionThree, content: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            sectionThree: { ...prev.sectionThree, content: "" }
                          }));
                        }}
                        name="content"
                        className={`form-control ${errors.sectionThree?.content ? "is-invalid" : ""}`}
                        placeholder="Enter content here"
                        value={form.sectionThree.content}
                        rows="3"
                      />
                      {errors.sectionThree?.content && <div className="invalid-feedback">{errors.sectionThree.content}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Elegibility */}

          <div className="col-12 mt-20 border border-2 rounded">
            <div className="card">
              <div 
                className="card-header" 
                style={{ cursor: 'pointer' }}
                onClick={() => setForm(prev => ({ ...prev, elegiblityExpanded: !prev.elegiblityExpanded }))}
              >
                <label className="form-label dropdown mb-0 d-flex align-items-center justify-content-between">
                  Eligibility
                </label>
              </div>
              
              {form.elegiblityExpanded && (
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Title</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, title: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, title: "" }
                          }));
                        }}
                        type="text"
                        name="title"
                        className={`form-control ${errors.elegiblity?.title ? "is-invalid" : ""}`}
                        placeholder="Enter title here"
                        value={form.elegiblity.title}
                      />
                      {errors.elegiblity?.title && <div className="invalid-feedback">{errors.elegiblity.title}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer One</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerOne: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerOne: "" }
                          }));
                        }}
                        type="text"
                        name="pointerOne"
                        className={`form-control ${errors.elegiblity?.pointerOne ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerOne}
                      />
                      {errors.elegiblity?.pointerOne && <div className="invalid-feedback">{errors.elegiblity.pointerOne}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer two</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerTwo: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerTwo: "" }
                          }));
                        }}
                        type="text"
                        name="pointerTwo"
                        className={`form-control ${errors.elegiblity?.pointerTwo ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerTwo}
                      />
                      {errors.elegiblity?.pointerTwo && <div className="invalid-feedback">{errors.elegiblity.pointerTwo}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer three</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerThree: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerThree: "" }
                          }));
                        }}
                        type="text"
                        name="pointerThree"
                        className={`form-control ${errors.elegiblity?.pointerThree ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerThree}
                      />
                      {errors.elegiblity?.pointerThree && <div className="invalid-feedback">{errors.elegiblity.pointerThree}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer four</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerFour: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerFour: "" }
                          }));
                        }}
                        type="text"
                        name="pointerFour"
                        className={`form-control ${errors.elegiblity?.pointerFour ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerFour}
                      />
                      {errors.elegiblity?.pointerFour && <div className="invalid-feedback">{errors.elegiblity.pointerFour}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer five</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerFive: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerFive: "" }
                          }));
                        }}
                        type="text"
                        name="pointerFive"
                        className={`form-control ${errors.elegiblity?.pointerFive ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerFive}
                      />
                      {errors.elegiblity?.pointerFive && <div className="invalid-feedback">{errors.elegiblity.pointerFive}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer six</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerSix: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerSix: "" }
                          }));
                        }}
                        type="text"
                        name="pointerSix"
                        className={`form-control ${errors.elegiblity?.pointerSix ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerSix}
                      />
                      {errors.elegiblity?.pointerSix && <div className="invalid-feedback">{errors.elegiblity.pointerSix}</div>}
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Pointer seven</label>
                      <input
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerSeven: e.target.value }
                          }));
                          setErrors((prev) => ({ 
                            ...prev, 
                            elegiblity: { ...prev.elegiblity, pointerSeven: "" }
                          }));
                        }}
                        type="text"
                        name="pointerSeven"
                        className={`form-control ${errors.elegiblity?.pointerSeven ? "is-invalid" : ""}`}
                        placeholder="Enter point here"
                        value={form.elegiblity.pointerSeven}
                      />
                      {errors.elegiblity?.pointerSeven && <div className="invalid-feedback">{errors.elegiblity.pointerSeven}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          { ele && ele._id ? "Update Service" : "Create Service"}
          </button>
        </div>
      </div>
    </div>
  </div>
)
}

export default CreateService;
