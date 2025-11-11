import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
} from 'react-bootstrap';
import { app } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createVideo, updateVideo, fetchVideos } from "../slice/VideoSlice";

const CreateVideo = ({ele, handleClose}) => {
  const storage = getStorage(app);
  const dispatch = useDispatch();
  const [form,setForm] = useState({
    name:ele?.name || "",
    videoURL: ele?.videoURL || "",
    thumbnailURL: ele?.thumbnailURL || "",
  })
  const [errors, setErrors] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState(ele && ele._id ? ele?.thumbnailURL : null);
  const [videoPreview, setVideoPreview] = useState(ele && ele._id ? ele?.videoURL : null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `thumbnails/${Date.now()}-${file.name}`);
    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const uploadVideo = async (file) => {
    const storageRef = ref(storage, `videos/${Date.now()}-${file.name}`);
    await uploadBytesResumable(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };
  
  const handleChange = async (event) => {
    const { name, value, type, files } = event.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (name === 'thumbnailURL') {
          try {
            setIsUploading(true);
            const previewURL = URL.createObjectURL(file);
            setThumbnailPreview(previewURL);
            const imageURL = await uploadImage(file);
            setForm(prev => ({ ...prev, thumbnailURL: imageURL }));
          } catch (error) {
            console.error("Error uploading thumbnail:", error);
            toast.error("Failed to upload thumbnail");
          } finally {
            setIsUploading(false);
          }
        } else if (name === "videoURL") {
          try {
            setIsUploading(true);
            const previewURL = URL.createObjectURL(file);
            setVideoPreview(previewURL);
            const videoURL = await uploadVideo(file);
            setForm(prev => ({ ...prev, videoURL: videoURL }));
          } catch (error) {
            console.error("Error uploading video:", error);
            toast.error("Failed to upload video");
          } finally {
            setIsUploading(false);
          }
        }
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (ele && ele._id) {
        // Update existing video
        const res = await dispatch(updateVideo({ id: ele._id, data: form }));
        if (updateVideo.fulfilled.match(res)) {
          toast.success("✅ Video updated successfully!");
          await dispatch(fetchVideos())
          handleClose();
        }
        else if (updateVideo.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to update video: " + errorMsg);
        }
      } else {
        // Create new video
        const res = await dispatch(createVideo(form));
        if (createVideo.fulfilled.match(res)) {
          toast.success("✅ Video created successfully!");
          await dispatch(fetchVideos())
          handleClose();
        } else if (createVideo.rejected.match(res)) {
          const errorMsg =
            res.payload?.message || res.error?.message || "Unknown error occurred.";
          toast.error("❌ Failed to create video: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to create Video:", error);
      toast.error("Failed to create Video");
    }
  }

  return (
    <Modal show={true} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton className="text-black">
        <Modal.Title>{ele && ele._id ? "Update Video" : "Add Video"}</Modal.Title>
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
            <Form.Label>Thumbnail</Form.Label>
            <Form.Control
              type="file"
              name="thumbnailURL"
              accept="image/*"
              onChange={handleChange}
              isInvalid={!!errors.thumbnailURL}
              disabled={isUploading}
            />
            {thumbnailPreview && <img src={thumbnailPreview} alt="thumbnail" className="mt-2 img-fluid rounded" />}
          </Form.Group>
                  <p className="color-red">Image size should be 1024 x 1536 px</p>

          <Form.Group className="mt-3">
            <Form.Label>Video File</Form.Label>
            <Form.Control
              type="file"
              name="videoURL"
              accept="video/*"
              onChange={handleChange}
              isInvalid={!!errors.videoURL}
              disabled={isUploading}
            />
            {videoPreview && <video src={videoPreview} alt="Video" className="mt-2 img-fluid rounded" controls />}
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

export default CreateVideo