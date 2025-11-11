import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteVideo, fetchVideos } from "../slice/VideoSlice";
import CreateVideo from "../form/CreateVideo";

const VideoManager = () => {
  const dispatch = useDispatch();
  const { videos } = useSelector((state) => state.video);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const tableRef = useRef(null); // ✅ ref for DataTable

  // Handle checkbox select
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Handle delete
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) {
      toast.warn("⚠️ No videos selected for deletion.");
      return;
    }

    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} videos?`
        : "Are you sure you want to delete this video?"
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(deleteVideo(idsToDelete));
      if (deleteVideo.fulfilled.match(res)) {
        toast.success("✅ Video(s) deleted successfully!");
        setSelectedIds([]);
        await dispatch(fetchVideos());
      } else {
        toast.error(
          "❌ Failed: " +
            (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("⚠️ Unexpected error: " + error.message);
    }
  };

  // Fetch videos
  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  // Initialize DataTable
  useEffect(() => {
    if (videos?.length > 0) {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      $(tableRef.current).DataTable({
        paging: true, // ✅ Pagination enabled
        searching: true, // ✅ Search enabled
        pageLength: 5, // ✅ show 5 per page
        lengthMenu: [5, 10, 20, 50], // dropdown for rows per page
      });
    }
  }, [videos]);

  return (
    <div className="card basic-data-table">
      <div className="card-header flex justify-between">
        <h5 className="card-title mb-0">Video Table</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Video
          </button>

          {selectedIds.length > 0 && (
            <button
              className="btn rounded-pill text-danger px-4 py-2 ml-2"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}

          {showModal && (
            <CreateVideo
              ele={editVideo}
              handleClose={() => {
                setShowModal(false);
                setEditVideo(null);
              }}
            />
          )}
        </div>
      </div>

      <div className="card-body">
        <table
          ref={tableRef}
          id="videoTable"
          className="table bordered-table mb-0"
        >
          <thead>
            <tr>
              <th scope="col">Select</th>
              <th scope="col">Name</th>
              <th scope="col">Video URL</th>
              <th scope="col">Thumbnail</th>
              <th scope="col">Created At</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {videos?.map((ele, ind) => (
              <tr key={ele._id || ind}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>
                <td>{ele?.name}</td>
                <td>
                  <a href={ele?.videoURL} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
                <td>
                  <a href={ele?.thumbnailURL} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
                <td>
                  {new Date(ele?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <Link
                    onClick={() => {
                      setShowModal(true);
                      setEditVideo(ele);
                    }}
                    to="#"
                    className="btn btn-sm btn-success"
                  >
                    <Icon icon="lucide:edit" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoManager;
