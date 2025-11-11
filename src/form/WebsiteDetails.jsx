import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Redux slices
import { updateStudyCourse } from "../slice/AbroadCourseSlice.js";
import { fetchAbroadUniversity } from "../slice/AbroadUniversitySlice.js";
import { fetchAbroadStudy } from "../slice/AbroadSlice.js";
import { fetchAbroadProvince } from "../slice/AbroadProvinceSlice.js";
import { createMbbsCourse } from "../slice/MbbsCourse.js";

// Custom editor
import TextEditor from "./TextEditor.jsx";

// Firebase imports for file upload
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { app } from "../firebase";
import { updateWebsiteDetail } from "../slice/websiteDetails.js";

const categories = [
  "Arts",
  "Accounts",
  "Finance",
  "Marketing",
  "Science",
  "Medical",
  "Computers",
  "Engineering",
  "Law",
  "Education",
  "Social Sciences",
  "Business Administration",
  "Psychology",
  "Economics",
  "Architecture",
  "Environmental Science",
  "Nursing",
  "Hospitality Management",
  "Media and Communication",
  "Information Technology",
  "Pharmacy",
  "Agriculture",
  "Design",
  "Public Health",
  "Mathematics",
  "Data Science",
  "Artificial Intelligence",
];

const level = [
  "High School",
  "UG Diploma/Cerificate/Associate Degree",
  "UG",
  "PG Diploma",
  "PG",
  "UG+PG(Accelerated)Degree",
  "PhD",
  "Foundation",
  "Short Term Program",
  "Pathway Program",
  "Twiming Program(UG)",
  "Twiming Program(PG)",
  "Online Programe/Distance Learning",
];

const mode = ["Yearly", "Complete", "Semester"];

const WebsiteDetails = ({ ele, handleClose, fetchData }) => {
  const dispatch = useDispatch();  
  const [loading, setLoading] = useState(false);
// console.log(ele,"--------------------------------------");

  const [form, setForm] = useState({
    counselling_no: ele?.counselling_no || "",
    call_no: ele?.call_no || "",
    whatsapp_no: ele?.whatsapp_no || "",
    mail: ele?.mail || "",
    insta: ele?.insta || "",
    facebook: ele?.facebook || "",
    address:ele?.address || "",
    linkedIn: ele?.linkedIn || "",
    twitter: ele?.twitter || ""
  });

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };





const handleSubmit = async () => {
  try {
    const res = await dispatch(updateWebsiteDetail(form)).unwrap();
    console.log("Success:", res);
    handleClose()
    fetchData()
    toast.success("Website details updated successfully!");
  } catch (err) {
    console.error("Error:", err);
    toast.error(err || "Something went wrong!");
  }
};


  


  return (
    <Modal show={true} onHide={handleClose} size="md" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{ele?._id ? "Update Website Details" : "Add Website Details"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Counselling Number</Form.Label>
            <Form.Control
              type="text"
              name="counselling_no"
              value={form.counselling_no}
              onChange={handleChange}
              placeholder="Enter counselling number"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Call Number</Form.Label>
            <Form.Control
              type="text"
              name="call_no"
              value={form.call_no}
              onChange={handleChange}
              placeholder="Enter call number"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>WhatsApp Number</Form.Label>
            <Form.Control
              type="text"
              name="whatsapp_no"
              value={form.whatsapp_no}
              onChange={handleChange}
              placeholder="Enter WhatsApp number"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="text"
              name="insta"
              value={form.insta}
              onChange={handleChange}
              placeholder="Instagram profile link"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Facebook</Form.Label>
            <Form.Control
              type="text"
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              placeholder="Facebook profile link"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>LinkedIn</Form.Label>
            <Form.Control
              type="text"
              name="linkedIn"
              value={form.linkedIn}
              onChange={handleChange}
              placeholder="LinkedIn profile link"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Twitter</Form.Label>
            <Form.Control
              type="text"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="Twitter profile link"
            />
          </Form.Group>
           <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : ele?._id ? "Update" : "Save"}
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default WebsiteDetails;