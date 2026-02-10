import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { fetchCountry } from "../slice/CountrySlicr";
import { deleteCmission, fetchComission } from "../slice/comission";
import CreateCommission from "../form/CreateCommission";

const PAGE_SIZE = 5;

const CommissionManager = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const comission = useSelector(
    (state) => state?.comission?.comission || []
  );

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);

  // 🔹 COUNTRY FILTER
  const [countryFilter, setCountryFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(fetchCountry());
    await dispatch(fetchComission());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredCommission = useMemo(() => {
    return comission.filter((c) => {
      if (!countryFilter) return true;

      return c?.SecondCountry?.name
        ?.toLowerCase()
        .includes(countryFilter.toLowerCase());
    });
  }, [comission, countryFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCommission.length / PAGE_SIZE);

  const paginatedCommission = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCommission.slice(start, start + PAGE_SIZE);
  }, [filteredCommission, page]);

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
      setSelectedIds(paginatedCommission.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one commission");
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedIds.length} commission(s)?`
    );
    if (!confirm) return;

    await dispatch(deleteCmission(selectedIds));
    toast.success("Selected commission(s) deleted");

    setSelectedIds([]);
    fetchData();
  };

  /* ================= JSX ================= */
  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between">
        <h5>Commission Manager</h5>

        <div>
          <button
            className="btn btn-primary mx-2"
            onClick={() => setShowModal(true)}
          >
            Create Commission
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
        {/* FILTER */}
        <div className="d-flex gap-3 mb-3">
          <input
            type="text"
            className="form-control w-25"
            placeholder="Filter by Country"
            value={countryFilter}
            onChange={(e) => {
              setPage(1);
              setCountryFilter(e.target.value);
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
                     className="form-check-input"
                    checked={
                      paginatedCommission.length > 0 &&
                      paginatedCommission.every((c) =>
                        selectedIds.includes(c._id)
                      )
                    }
                    onChange={handleSelectAll}
                  />
                  
                </th>
                <th>Target</th>
                <th>Title</th>
                <th>File</th>
                <th>Country</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCommission.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                [...paginatedCommission].reverse().map((ele) => (
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

                    <td>{ele?.target}</td>
                    <td>{ele?.title || "---------"}</td>

                    <td>
                      {ele?.fileURL ? (
                        <a
                          href={ele.fileURL}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
                      ) : "—"}
                    </td>

                    <td>
                      {ele?.SecondCountry?.name || "---------"}
                    </td>

                    <td>
                      {new Date(ele?.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setEditingCommission(ele);
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
        <CreateCommission
          ele={editingCommission}
          fetchData={fetchData}
          handleClose={() => {
            setShowModal(false);
            setEditingCommission(null);
          }}
        />
      )}
    </div>
  );
};

export default CommissionManager;
