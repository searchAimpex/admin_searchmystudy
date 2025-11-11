import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CreateMedia from "../form/CreateMedia";
import { deleteMedia, fetchMedias } from "../slice/MediaSlice";

const MediaManager = () => {
  const dispatch = useDispatch();
  const { medias } = useSelector((state) => state.media);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMedia, setEditVideo] = useState(null);

  // Handle checkbox (select blogs)
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Delete single OR multiple blogs
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warn("⚠️ No media selected for deletion.");
      return;
    }

    const confirmed = window.confirm(
      selectedIds.length > 1
        ? `Are you sure you want to delete ${selectedIds.length} medias?`
        : "Are you sure you want to delete this media?"
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(deleteMedia(selectedIds));
      if (deleteMedia.fulfilled.match(res)) {
        toast.success("✅ Media deleted successfully!");
        setSelectedIds([]);
        await dispatch(fetchMedias());
      } else {
        toast.error(
          "❌ Failed to delete: " +
            (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  // Fetch data
  const data = async () => {
    await dispatch(fetchMedias());
  };

  useEffect(() => {
    data();
  }, []);

  // 🔥 Initialize DataTables after medias update
  useEffect(() => {
    if (medias?.length > 0) {
      if ($.fn.DataTable.isDataTable("#mediaTable")) {
        $("#mediaTable").DataTable().destroy(); // destroy old instance
      }
      $("#mediaTable").DataTable({
        paging: true,
        searching: true,
        ordering: true,
        pageLength: 5,
        lengthMenu: [5, 10, 25, 50],
      });
    }
  }, [medias]);

  return (
    <div className="card basic-data-table">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h5 className="card-title mb-0">Media Table</h5>
        <div>
          <button
            type="button"
            className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Media
          </button>

          <button
            className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2"
            onClick={handleDelete}
          >
            Delete Selected ({selectedIds.length})
          </button>

          {showModal && (
            <CreateMedia
              ele={editMedia}
              handleClose={() => {
                setShowModal(false);
                setEditVideo(null);
              }}
            />
          )}
        </div>
      </div>

      <div className="card-body overflow-x-auto">
        <table id="mediaTable" className="table bordered-table mb-0">
          <thead>
            <tr>
              <th scope="col">Select</th>
              <th scope="col">S.L</th>
              <th scope="col">Title</th>
              <th scope="col">Description</th>
              <th scope="col">Image</th>
              <th scope="col">Article</th>
              <th scope="col">Created At</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {medias?.map((ele, ind) => (
              <tr key={ele._id || ind}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>
                <td>{ind + 1}</td>
                <td>{ele?.title}</td>
                <td>{ele?.description}</td>
                <td>
                  <a href={ele?.imageURL} target="_blank" rel="noopener noreferrer">
                    Click to View
                  </a>
                </td>
                <td>
                  <a href={ele?.articalURL} target="_blank" rel="noopener noreferrer">
                    Click to View
                  </a>
                </td>
                <td>
                  <span className="text-success-main px-24 py-4 rounded-pill fw-medium text-sm">
                    {new Date(ele?.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>
                </td>
                <td>
                  <Link
                    onClick={() => {
                      setEditVideo(ele);
                      setShowModal(true);
                    }}
                    to="#"
                    className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
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

export default MediaManager;
