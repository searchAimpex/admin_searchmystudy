import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { deleteLoanLead, fetchLoanLead } from "../slice/loanLead";
import { fetchCountry } from "../slice/CountrySlicr";
import CreateLoanLead from "../form/CreateLoanLead";

const PAGE_SIZE = 5;

const LoanLeadManager = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const loan = useSelector((state) => state?.loan?.loan || []);

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // 🔹 STATUS FILTER
  const [statusFilter, setStatusFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(fetchCountry());
    await dispatch(fetchLoanLead());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredLoan = useMemo(() => {
    return loan.filter((l) => {
      if (!statusFilter) return true;
      return l?.status === statusFilter;
    });
  }, [loan, statusFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredLoan.length / PAGE_SIZE);

  const paginatedLoan = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLoan.slice(start, start + PAGE_SIZE);
  }, [filteredLoan, page]);

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
      setSelectedIds(paginatedLoan.map((l) => l._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one lead");
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedIds.length} lead(s)?`
    );
    if (!confirm) return;

    await dispatch(deleteLoanLead(selectedIds));
    toast.success("Selected lead(s) deleted");

    setSelectedIds([]);
    fetchData();
  };

  /* ================= STATUS COLOR ================= */
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return { backgroundColor: "green" };
      case "rejected":
        return { backgroundColor: "red" };
      case "processing":
        return { backgroundColor: "blue" };
      default:
        return { backgroundColor: "orange" };
    }
  };

  /* ================= JSX ================= */
  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between">
        <h5>Loan Lead Manager</h5>

        <div>
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
          <select
            className="form-select w-25"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>
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
                      paginatedLoan.length > 0 &&
                      paginatedLoan.every((l) =>
                        selectedIds.includes(l._id)
                      )
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Tracking ID</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Last Name</th>
                <th>File</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLoan.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedLoan.map((ele) => (
                  <tr key={ele._id}>
                    <td>
                      <input
                         className="form-check-input"

                        type="checkbox"
                        checked={selectedIds.includes(ele._id)}
                        onChange={() =>
                          handleCheckboxChange(ele._id)
                        }
                      />
                    </td>

                    <td>{ele?.trackingId}</td>
                    <td>{ele?.firstName}</td>
                    <td>{ele?.middleName}</td>
                    <td>{ele?.lastName}</td>

                    <td>
                      {ele?.offerLetter ? (
                        <a
                          href={ele.offerLetter}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
                      ) : "—"}
                    </td>

                    <td>
                      <span
                        style={{
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          ...getStatusStyle(ele?.status),
                        }}
                      >
                        {ele?.status}
                      </span>
                    </td>

                    <td>
                      {new Date(ele?.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setEditingLead(ele);
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
        <CreateLoanLead
          ele={editingLead}
          fetchData={fetchData}
          handleClose={() => {
            setShowModal(false);
            setEditingLead(null);
          }}
        />
      )}
    </div>
  );
};

export default LoanLeadManager;
