import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { createVideo, updateVideo, fetchVideos } from "../slice/VideoSlice";

const BACKEND_ASSET_BASE = "https://backend.searchmystudy.com";

function getPreviewUrl(value) {
  if (value == null || value === "") return "";
  let s = typeof value === "string" ? value.trim() : String(value).trim();
  if (!s) return "";
  const blobAt = s.toLowerCase().indexOf("blob:");
  if (blobAt > 0) s = s.slice(blobAt);
  if (/^blob:/i.test(s) || /^data:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return `${BACKEND_ASSET_BASE}/${s.replace(/^\/+/, "")}`;
}

const CreateVideo = ({ ele, handleClose }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: ele?.name || "",
    videoURL: ele?.videoURL || "",
    thumbnailURL: ele?.thumbnailURL || "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (ele?._id) {
      setForm({
        name: ele.name || "",
        videoURL: ele.videoURL || "",
        thumbnailURL: ele.thumbnailURL || "",
      });
      setThumbnailFile(null);
      setVideoFile(null);
      setThumbnailPreview(ele.thumbnailURL ? getPreviewUrl(ele.thumbnailURL) : null);
      setVideoPreview(ele.videoURL ? getPreviewUrl(ele.videoURL) : null);
    } else {
      setForm({ name: "", videoURL: "", thumbnailURL: "" });
      setThumbnailFile(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setVideoPreview(null);
    }
  }, [ele]);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;
      if (name === "thumbnailURL") {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else if (name === "videoURL") {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name ?? "");
    if (thumbnailFile) {
      fd.append("thumbnailURL", thumbnailFile);
    } else if (form.thumbnailURL) {
      fd.append("thumbnailURL", form.thumbnailURL);
    }
    if (videoFile) {
      fd.append("videoURL", videoFile);
    } else if (form.videoURL) {
      fd.append("videoURL", form.videoURL);
    }
    return fd;
  };

  const handleSubmit = async () => {
    if (!String(form.name || "").trim()) {
      toast.error("Name is required");
      return;
    }

    const isCreate = !ele?._id;
    if (isCreate) {
      const hasThumb = thumbnailFile || String(form.thumbnailURL || "").trim();
      const hasVideo = videoFile || String(form.videoURL || "").trim();
      if (!hasThumb || !hasVideo) {
        toast.error("Thumbnail and video are required");
        return;
      }
    }

    setIsUploading(true);
    try {
      if (ele && ele._id) {
        const fd = buildFormData();
        const res = await dispatch(updateVideo({ id: ele._id, data: fd }));
        if (updateVideo.fulfilled.match(res)) {
          toast.success("Video updated successfully!");
          await dispatch(fetchVideos());
          handleClose();
        } else if (updateVideo.rejected.match(res)) {
          const p = res.payload;
          const errorMsg =
            (typeof p === "string" ? p : p?.message) || res.error?.message || "Unknown error";
          toast.error("Failed to update video: " + errorMsg);
        }
      } else {
        const fd = buildFormData();
        const res = await dispatch(createVideo(fd));
        if (createVideo.fulfilled.match(res)) {
          toast.success("Video created successfully!");
          await dispatch(fetchVideos());
          handleClose();
        } else if (createVideo.rejected.match(res)) {
          const p = res.payload;
          const errorMsg =
            (typeof p === "string" ? p : p?.message) || res.error?.message || "Unknown error";
          toast.error("Failed to create video: " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Failed to save video:", error);
      toast.error("Failed to save video");
    } finally {
      setIsUploading(false);
    }
  };

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
              disabled={isUploading}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Thumbnail</Form.Label>
            <Form.Control
              type="file"
              name="thumbnailURL"
              accept="image/*"
              onChange={handleChange}
              disabled={isUploading}
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="thumbnail"
                className="mt-2 img-fluid rounded"
                style={{ maxHeight: 200, objectFit: "contain" }}
              />
            )}
          </Form.Group>
          <p className="text-danger small">Image size should be 1024 x 1536 px</p>

          <Form.Group className="mt-3">
            <Form.Label>Video File</Form.Label>
            <Form.Control
              type="file"
              name="videoURL"
              accept="video/*"
              onChange={handleChange}
              disabled={isUploading}
            />
            {videoPreview && (
              <video
                src={videoPreview}
                className="mt-2 img-fluid rounded"
                controls
                style={{ maxHeight: 240 }}
              />
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? "Saving…" : ele && ele._id ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateVideo;
