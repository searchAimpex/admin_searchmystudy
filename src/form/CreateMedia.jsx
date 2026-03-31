import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
} from 'react-bootstrap';
import TextEditor from "./TextEditor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createVideo, updateVideo, fetchVideos } from "../slice/VideoSlice";
import { createMedia, fetchMedias, updateMedia } from "../slice/MediaSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

const getAssetUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (value.startsWith("blob:") || /^https?:\/\//i.test(value)) return value;
  return `${BACKEND_ASSET_BASE}/${value.replace(/^\/+/, "")}`;
};

const CreateMedia = ({ ele, handleClose}) => {
  const dispatch = useDispatch();
  const [form,setForm] = useState({
    title:ele?.title || "",
    description:ele?.description || "",
    imageURL: ele?.imageURL || "",
    articalURL: ele?.articalURL || "",
  })

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(ele && ele._id ? ele?.imageURL : null);
  const [imageFile, setImageFile] = useState(null);
  const [articleFile, setArticleFile] = useState(null);

  const handleChange = async (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (name === 'imageURL') {
          const previewURL = URL.createObjectURL(file);
          setImagePreview(previewURL);
          setImageFile(file);
          setForm(prev => ({ ...prev, imageURL: file.name }));
        } else if (name === 'articalURL') {
          setArticleFile(file);
          setForm(prev => ({ ...prev, articalURL: file.name }));
        }
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (articleFile) {
        formData.append("articalURL", articleFile);
      } else if (form.articalURL) {
        formData.append("articalURL", form.articalURL);
      }
      if (imageFile) {
        formData.append("imageURL", imageFile);
      } else if (form.imageURL) {
        formData.append("imageURL", form.imageURL);
      }

      if (ele && ele._id) {
        // Update existing media
        const res = await dispatch(updateMedia({ id: ele._id, data: formData }));
        if (updateMedia.fulfilled.match(res)) {
          toast.success("✅ Media updated successfully!");
          await dispatch(fetchMedias())
          handleClose();
        }
        else if (updateMedia.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update media: " + errorMsg);
        }
      } else {
        // Create new video
        const res = await dispatch(createMedia(formData));
        if (createMedia.fulfilled.match(res)) {
          toast.success("✅ Media created successfully!");
          await dispatch(fetchMedias())
          handleClose();
        } else if (createMedia.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to create media: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to create media:", error);
      toast.error("Failed to create media");
    }
  }
  return (
    <Modal show={true} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="text-black">
        <Modal.Title>{ele && ele._id ? "Update Media" : "Add Media"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <TextEditor content={form.description} setContent={handleContentChange} />
            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Article</Form.Label>
            <Form.Control
              type="file"
              name="articalURL"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleChange}
              isInvalid={!!errors.articalURL}
            />
            {form.articalURL && (
              <a
                href={getAssetUrl(form.articalURL)}
                target="_blank"
                rel="noreferrer"
                className="d-block mt-2 text-primary"
              >
                View article file
              </a>
            )}
            <Form.Control.Feedback type="invalid">{errors.articleURL}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="imageURL"
              accept="image/*"
              onChange={handleChange}
              isInvalid={!!errors.imageURL}
            />
            {imagePreview && <img src={getAssetUrl(imagePreview)} alt="image" className="mt-2 img-fluid rounded" />}
            <p>Image should be 320*250px</p>
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

export default CreateMedia