import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { fetchCountry, fetchFile, deleteFiles } from "../slice/CountrySlicr";
import CreateFile from "../form/CreateFile";

const PAGE_SIZE = 5;

const FileManager = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const files = useSelector(
    (state) => state.country?.file?.data || []
  );

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  // 🔹 FILTER STATES
  const [countryFilter, setCountryFilter] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(fetchCountry());
    await dispatch(fetchFile());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const countryMatch = f?.SecondCountry?.name
        ?.toLowerCase()
        .includes(countryFilter.toLowerCase());

      const universityMatch = f?.university?.name
        ?.toLowerCase()
        .includes(universityFilter.toLowerCase());

      return countryMatch && universityMatch;
    });
  }, [files, countryFilter, universityFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredFiles.length / PAGE_SIZE);

  const paginatedFiles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredFiles.slice(start, start + PAGE_SIZE);
  }, [filteredFiles, page]);

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedFiles.map((f) => f._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one file");
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedIds.length} file(s)?`
    );
    if (!confirm) return;

    await dispatch(deleteFiles(selectedIds));
    toast.success("Selected file(s) deleted");

    setSelectedIds([]);
    fetchData();
  };

  /* ================= JSX ================= */
  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between">
        <h5>File Manager</h5>

        <div>
          <button
            className="btn btn-primary mx-2"
            onClick={() => setShowModal(true)}
          >
            Create File
          </button>

          <button
            className="btn btn-danger mx-2"
            onClick={handleDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="card-body">
        {/* FILTERS */}
        <div className="d-flex gap-3 mb-3">
          <input
            className="form-control w-25"
            placeholder="Filter by Country"
            value={countryFilter}
            onChange={(e) => {
              setPage(1);
              setCountryFilter(e.target.value);
            }}
          />

          <input
            className="form-control w-25"
            placeholder="Filter by University"
            value={universityFilter}
            onChange={(e) => {
              setPage(1);
              setUniversityFilter(e.target.value);
            }}
          />
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className=""
                    checked={
                      paginatedFiles.length > 0 &&
                      paginatedFiles.every((f) =>
                        selectedIds.includes(f._id)
                      )
                    }
                    onChange={handleSelectAll}
                  />Select
                </th>
                <th>Country</th>
                <th>University</th>
                <th>Name</th>
                <th>Type</th>
                <th>File</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedFiles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((ele) => (
                  <tr key={ele._id}>
                    <td>
                      <input
                        type="checkbox"
                         className="form-check-input"
                        checked={selectedIds.includes(ele._id)}
                        onChange={() =>
                          handleCheckboxChange(ele._id)
                        }
                      />
                    </td>

                    <td>{ele?.SecondCountry?.name || "—"}</td>
                    <td>{ele?.university?.name || "—"}</td>
                    <td>{ele?.name}</td>
                    <td>{ele?.type}</td>

                    <td>
                      {ele?.template ? (
                        <a href={ele.template} target="_blank">
                          Link
                        </a>
                      ) : "—"}
                    </td>

                    <td>
                      {new Date(ele?.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setEditingFile(ele);
                          setShowModal(true);
                        }}
                      >
                        <Icon icon="lucide:edit" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3 gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span className="px-3 align-self-center">
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <CreateFile
          ele={editingFile}
          fetchData={fetchData}
          handleClose={() => {
            setShowModal(false);
            setEditingFile(null);
          }}
        />
      )}
    </div>
  );
};

export default FileManager;
