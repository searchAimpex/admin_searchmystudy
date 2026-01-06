import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchCountry,
  deleteSecondCountry,
} from "../slice/CountrySlicr";

import CreateCountryDocs from "../form/CreateCountryDocs";

const PAGE_SIZE = 5;

const CountryManager = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const countries = useSelector((state) => state.country.country || []);

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);

  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");

  const [page, setPage] = useState(1);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(fetchCountry());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  /* ================= FILTER ================= */
  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      const nameMatch = c?.name
        ?.toLowerCase()
        .includes(nameFilter.toLowerCase());

      const codeMatch = c?.code
        ?.toLowerCase()
        .includes(codeFilter.toLowerCase());

      return nameMatch && codeMatch;
    });
  }, [countries, nameFilter, codeFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCountries.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCountries.slice(start, start + PAGE_SIZE);
  }, [filteredCountries, page]);

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
      setSelectedIds(paginatedData.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one country");
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedIds.length} selected country(s)?`
    );

    if (!confirm) return;

    await dispatch(deleteSecondCountry(selectedIds));
    toast.success("Country deleted successfully");

    setSelectedIds([]);
    fetchData();
  };

  /* ================= JSX ================= */
  return (
    <div className="card">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between">
        <h5>Country Manager</h5>

        <div>
          <button
            className="btn btn-primary mx-2"
            onClick={() => setShowModal(true)}
          >
            Add Country
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
            placeholder="Filter by Name"
            value={nameFilter}
            onChange={(e) => {
              setPage(1);
              setNameFilter(e.target.value);
            }}
          />

          <input
            className="form-control w-25"
            placeholder="Filter by Code"
            value={codeFilter}
            onChange={(e) => {
              setPage(1);
              setCodeFilter(e.target.value);
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
                   className="form-check-input"
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((c) =>
                        selectedIds.includes(c._id)
                      )
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Code</th>
                <th>FAQ</th>
                <th>Currency</th>
                <th>Step</th>
                <th>Flag</th>
                <th>Why Country</th>
                <th>VFS</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c._id)}
                        onChange={() =>
                          handleCheckboxChange(c._id)
                        }
                      />
                    </td>

                    <td>{c.name}</td>
                    <td>{c.code}</td>

                    <td>
                      {c.faq ? (
                        <a href={c.faq} target="_blank">Link</a>
                      ) : "—"}
                    </td>

                    <td>{c.currency || "—"}</td>

                    <td>
                      {c.step ? (
                        <a href={c.step} target="_blank">Link</a>
                      ) : "—"}
                    </td>

                    <td>
                      {c.flagURL ? (
                        <a href={c.flagURL} target="_blank">Link</a>
                      ) : "—"}
                    </td>

                    <td>
                      {c.whyThisCountry ? (
                        <a
                          href={c.whyThisCountry}
                          target="_blank"
                        >
                          Link
                        </a>
                      ) : "—"}
                    </td>

                    <td>
                      {c.vfs ? (
                        <a href={c.vfs} target="_blank">VFS</a>
                      ) : "—"}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          setEditingCountry(c);
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
        <CreateCountryDocs
          ele={editingCountry}
          fetchData={fetchData}
          handleClose={() => {
            setShowModal(false);
            setEditingCountry(null);
          }}
        />
      )}
    </div>
  );
};

export default CountryManager;
