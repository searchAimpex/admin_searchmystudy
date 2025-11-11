import { useState } from "react";
import TextEditor from "./TextEditor";
import { blogUpdate, createBlogThunk } from "../slice/blogSlice";
import { useDispatch } from "react-redux";

import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
// import { storage } from "../firebase"; // adjust path
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { app } from "../firebase";
import { toast } from "react-toastify";
// import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
const storage = getStorage(app);

export default function UpdateBlog({ handleClose, loadBlogs, updateBlog }) {
    const dispatch = useDispatch();
    console.log(updateBlog);
    
    const [form, setForm] = useState({
        title: updateBlog?.title || "",
        bannerURL: updateBlog?.bannerURL || "",
        date: updateBlog?.date || "",
        content: updateBlog?.content || "",
        thumbnailURL: updateBlog?.thumbnailURL || "",
    });

    const [uploads, setUploads] = useState({
        banner: { progress: 0, preview: null, name: "", loading: false },
        thumbnail: { progress: 0, preview: null, name: "", loading: false },
    });

    const [errors, setErrors] = useState({});

    const handleFileChange = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploads((prev) => ({
            ...prev,
            [type]: { ...prev[type], loading: true, name: file.name },
        }));

        try {
            const previewURL = URL.createObjectURL(file);

            const progressInterval = setInterval(() => {
                setUploads((prev) => ({
                    ...prev,
                    [type]: {
                        ...prev[type],
                        progress: Math.min(prev[type].progress + 10, 90),
                    },
                }));
            }, 200);

            const storageRef = ref(storage, `${type}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            clearInterval(progressInterval);

            setForm((prev) => ({ ...prev, [`${type}URL`]: url }));
            setUploads((prev) => ({
                ...prev,
                [type]: { progress: 100, preview: previewURL, name: file.name, loading: false },
            }));

            toast.success(`${type} uploaded successfully!`);
        } catch (error) {
            console.error(`Failed to upload ${type}:`, error);
            setUploads((prev) => ({
                ...prev,
                [type]: { progress: 0, preview: null, name: "", loading: false },
            }));
            toast.error(`Failed to upload ${type}`);
        }
    };

    const handleContentChange = (value) => {
        setForm((prev) => ({ ...prev, content: value }));
        setErrors((prev) => ({ ...prev, content: "" }));
    };
console.log(form);

    const validateForm = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.bannerURL.trim()) newErrors.bannerURL = "Banner image is required";
        if (!form.date.trim()) newErrors.date = "Date is required";
        if (!form.content.trim()) newErrors.content = "Content is required";
        if (!form.thumbnailURL.trim()) newErrors.thumbnailURL = "Thumbnail image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

  const handleSubmit = async () => {
    if (!validateForm()) {
        toast.error("Please fill in all required fields.");
        return;
    }

    try {
            const res = await dispatch(
                blogUpdate({ form, id: updateBlog?._id })
            );

        console.log(res, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        if (blogUpdate.fulfilled.match(res)) {
            toast.success("✅ Blog updated successfully!");
            handleClose();
            loadBlogs();
        } else if (blogUpdate.rejected.match(res)) {
            const errorMsg =
                res.payload?.message || res.error?.message || "Unknown error occurred.";
            toast.error("❌ Failed to update blog: " + errorMsg);
        }
    } catch (error) {
        console.error(error);
        toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
};



    return (
        <>
            {/* <ToastContainer /> */}
            <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog" style={{ maxWidth: "800px" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Update Blog</h5>
                            <button type="button" className="btn-close" onClick={handleClose}></button>
                        </div>

                        <div className="p-4">
                            {/* Title */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                    placeholder="Enter title here"
                                    value={form.title}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, title: e.target.value }));
                                        setErrors((prev) => ({ ...prev, title: "" }));
                                    }}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>

                            {/* Banner Upload */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Upload Banner</label>
                                <input
                                    className={`form-control form-control-lg ${errors.bannerURL ? "is-invalid" : ""}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "banner")}
                                />
                                <p style={{ color: "red" }}>Banner Size should be 2400x400 px</p>
                                {form?.bannerURL && <img src={form?.bannerURL} alt="banner" width="500" />}
                                {errors.bannerURL && <div className="invalid-feedback">{errors.bannerURL}</div>}
                              

                            </div>

                            {/* Thumbnail Upload */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Upload Thumbnail</label>
                                <input
                                    className={`form-control form-control-lg ${errors.thumbnailURL ? "is-invalid" : ""}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "thumbnail")}
                                />
                                <p style={{ color: "red" }}>Thumbnail Size should be 1200x900 px</p>
                                {form?.thumbnailURL && <img src={form?.thumbnailURL} alt="thumbnail" width="200" />}
                                {errors.thumbnailURL && <div className="invalid-feedback">{errors.thumbnailURL}</div>}

                            </div>

                            {/* Content */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Content</label>
                                <TextEditor content={form.content} setContent={handleContentChange} />
                                {errors.content && <div style={{ color: "red", marginTop: "5px" }}>{errors.content}</div>}
                            </div>

                            {/* Date */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Select Date</label>
                                <input
                                    className={`form-control form-control-lg ${errors.date ? "is-invalid" : ""}`}
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, date: e.target.value }));
                                        setErrors((prev) => ({ ...prev, date: "" }));
                                    }}
                                />
                                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
