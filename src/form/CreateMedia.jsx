import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
} from 'react-bootstrap';
import { app } from "../firebase";
import TextEditor from "./TextEditor";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createVideo, updateVideo, fetchVideos } from "../slice/VideoSlice";
import { createMedia, fetchMedias, updateMedia } from "../slice/MediaSlice";


const CreateMedia = ({ ele, handleClose}) => {
  const storage = getStorage(app);
  const dispatch = useDispatch();
  const [form,setForm] = useState({
    title:ele?.title || "",
    description:ele?.description || "",
    imageURL: ele?.videoURL || "",
    articalURL: ele?.articalURL || "",
  })

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(ele && ele._id ? ele?.imageURL : null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `thumbnails/${Date.now()}-${file.name}`);
    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleChange = async (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (name === 'imageURL') {
          try {
            setIsUploading(true);
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
            const imageURL = await uploadImage(file);
            setForm(prev => ({ ...prev, imageURL: imageURL }));
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
          } finally {
            setIsUploading(false);
          }
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
      if (ele && ele._id) {
        // Update existing media
        const res = await dispatch(updateMedia({ id: ele._id, data: form }));
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
        const res = await dispatch(createMedia(form));
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
              type="text"
              name="articalURL"
              value={form.articalURL}
              onChange={handleChange}
              isInvalid={!!errors.articalURL}
            />
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
              disabled={isUploading}
            />
            {imagePreview && <img src={imagePreview} alt="image" className="mt-2 img-fluid rounded" />}
            <p>Image should be 320*250px</p>
          </Form.Group>
          {isUploading && (
            <div className="text-center mt-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
              <p className="mt-2">Uploading file...</p>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isUploading}>
          {ele && ele._id ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateMedia