import { useEffect, useState } from "react";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteBlog, fetchBlog, GetOneBlog } from "../slice/blogSlice";
import CreateBlog from "../form/CreateBlog";
import UpdateBlog from "../form/UpdateBlog";
import { toast } from "react-toastify";

const BlogManager = () => {
  const dispatch = useDispatch();
  const [blog, setBlog] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateBlog, setUpdateBlog] = useState();

  // --- Pagination and Search State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [searchTerm, setSearchTerm] = useState("");
  // --- End of State ---

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchBlog());
      if (res?.meta?.requestStatus === "fulfilled") {
        setBlog(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [dispatch]);

  // --- Search and Filter Logic ---
  const filteredBlogs = blog.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- End of Search Logic ---

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);
  console.log(currentBlogs);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // --- End of Pagination Logic ---

  // Handle checkbox (select blogs)
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;
    if (idsToDelete.length === 0) {
      toast.warn("⚠️ No blogs selected for deletion.");
      return;
    }

    const confirmed = window.confirm(
      idsToDelete.length > 1
        ? `Are you sure you want to delete ${idsToDelete.length} blogs?`
        : "Are you sure you want to delete this blog?"
    );
    if (!confirmed) return;

    try {
      const res = await dispatch(deleteBlog(idsToDelete));

      if (deleteBlog.fulfilled.match(res)) {
        toast.success("✅ Blog deleted successfully!");
        setSelectedIds([]);
        loadBlogs();
      } else if (deleteBlog.rejected.match(res)) {
        toast.error(
          "❌ Failed to delete blog: " +
          (res.payload?.message || res.error?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Unexpected error: " + (error.message || "Something went wrong"));
    }
  };

  const editHandler = async (id) => {
    try {
      const res = await dispatch(GetOneBlog(id));
      if (res?.meta?.requestStatus === "fulfilled") {
        setUpdateBlog(res?.payload);
        setEditModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card basic-data-table">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h5 className="card-title mb-0">Blog Tables</h5>
        <div>
          <button
            type="button"
            className="btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add blog
          </button>
          {selectedIds.length > 0 && (
            <button
              className="btn rounded-pill text-danger radius-8 px-4 py-2 ms-2"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}

          {showModal && (
            <CreateBlog
              loadBlogs={loadBlogs}
              handleClose={() => setShowModal(false)}
            />
          )}
          {editModal && (
            <UpdateBlog
              loadBlogs={loadBlogs}
              updateBlog={updateBlog}
              handleClose={() => setEditModal(false)}
            />
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Search Input Field */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>

        {loading ? (
          <p className="text-center py-4">Loading blogs...</p>
        ) : (
          <>
            <style>{`...`}</style>
            <table
              id="dataTable"
              className="table bordered-table mb-0"
              data-page-length={10}
            >
              <thead>
                <tr>
                  <th scope="col">...</th>
                  <th scope="col">Thumbnail</th>
                  <th scope="col">Banner</th>
                  <th scope="col">Title</th>
                  <th scope="col">Content</th>

                  <th scope="col">Date</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBlogs.reverse().map((ele, ind) => (
                  <tr key={ele._id || ind}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(ele._id)}
                          onChange={() => handleCheckboxChange(ele._id)}
                        />
                        <label className="form-check-label">{indexOfFirstItem + ind + 1}</label>
                      </div>
                    </td>
                    <td>
                      <a href={ele?.thumbnailURL}>Click to view</a>
                    </td>
                    <td>
                      <a href={ele?.bannerURL}>Click to view</a>
                    </td>
                    <td>{ele?.title}</td>
                    <td>
                      {ele?.content
                        ?.replace(/<[^>]*>/g, "") // remove HTML tags
                        .slice(0, 30)             // take first 10 characters
                      }
                    </td>


                    <td>{ele?.date}</td>
                    <td>
                      {ele?.createdAt
                        ? new Date(ele.createdAt).toLocaleDateString('en-GB') // DD/MM/YYYY
                        : '-'}
                    </td>

                    <td>  <Link
                      onClick={() => {
                        setEditModal(ele);
                        // setShowModal(true);
                      }}
                      to="#"
                      className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                    >
                      <Icon icon="lucide:edit" />
                    </Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="d-flex justify-content-center align-items-center mt-3">
        {/* Pagination Controls */}
        <button
          className="btn rounded-pill me-2"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="d-flex">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={`btn rounded-circle mx-1 ${currentPage === number ? "btn-primary" : "btn-light"
                }`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
        </div>

        <button
          className="btn rounded-pill ms-2"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogManager;