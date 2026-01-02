import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  deletePartner,
  fetchPartner,
  updateStatus,
} from "../slice/PartnerSlice";

import CreatePartner from "../form/CreatePartner";

const PartnerManager = () => {
  const dispatch = useDispatch();
  const partners = useSelector((state) => state.partner.partner);
  console.log(partners,"///////////////////////////")
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // 🔹 FILTER STATES
  const [statusFilter, setStatusFilter] = useState("");
  const [centerCodeFilter, setCenterCodeFilter] = useState("");

  // ================= FETCH DATA =================
  const fetchData = async () => {
    const a  =await dispatch(fetchPartner());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // ================= FILTER LOGIC =================
  const filteredPartners = partners?.filter((ele) => {
    const statusMatch =
      statusFilter === ""
        ? true
        : String(ele.status) === statusFilter;

    const centerCodeMatch =
      centerCodeFilter === ""
        ? true
        : ele.CenterCode === centerCodeFilter;

    return statusMatch && centerCodeMatch;
  });

  // ================= UNIQUE CENTER CODES =================
  const uniqueCenterCodes = [
    ...new Set(partners?.map((p) => p.CenterCode)),
  ];

  // ================= DATATABLE =================
  useEffect(() => {
    if (filteredPartners?.length >= 0) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }

      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
      });
    }
  }, [filteredPartners]);

  // ================= CHECKBOX =================
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one partner");
      return;
    }

    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    try {
      await dispatch(deletePartner(selectedIds)).unwrap();
      toast.success("Deleted successfully");
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ================= STATUS UPDATE =================
  const statusHandler = async (id, status) => {
    try {
      const a = await dispatch(updateStatus({ id, status }));
      console.log(a,"-----------------")
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="card basic-data-table">
      {/* ================= HEADER ================= */}
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h5 className="card-title mb-0">Partner Table</h5>

        <div>
          <button
            className="mx-2 btn btn-primary rounded-pill"
            onClick={() => setShowModal(true)}
          >
            Add Partner
          </button>

          <button
            className="mx-2 btn btn-danger rounded-pill"
            onClick={handleDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card-body">
        <div className="d-flex gap-3 mb-3">
          {/* STATUS FILTER */}
          <select
            className="form-select w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* CENTER CODE FILTER */}
          <select
            className="form-select w-auto"
            value={centerCodeFilter}
            onChange={(e) => setCenterCodeFilter(e.target.value)}
          >
            <option value="">All Center Codes</option>
            {uniqueCenterCodes?.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>    
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table 
          // id="dataTable"
           className="table bordered-table mb-0">
            <thead>
              <tr>
                <th>Check</th>
                <th>Center Name</th>
                <th>Owner Name</th>
                <th>Center Code</th>
                <th>Email</th>
                <th>Status</th>
                <th>Password</th>
                <th>City</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {partners?.map((ele) => (
                <tr key={ele._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ele._id)}
                      onChange={() => handleCheckboxChange(ele._id)}
                    />
                  </td>

                  <td>{ele?.name}</td>
                  <td>{ele?.OwnerName}</td>
                  <td>{ele?.CenterCode}</td>
                  <td>{ele?.email}</td>

                  <td>
                    <select
                      value={String(ele?.status)}
                      onChange={(e) =>
                        statusHandler(ele._id, e.target.value === "true")
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </td>

                  <td>{ele?.passwordTracker || "Null"}</td>
                  <td>{ele?.city}</td>

                  <td>
                    {new Date(ele?.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <Link
                      to="#"
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setEditingPartner(ele);
                        setShowModal(true);
                      }}
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

      {/* ================= MODAL ================= */}
      {showModal && (
        <CreatePartner
          fetchData={fetchData}
          ele={editingPartner}
          handleClose={() => {
            setShowModal(false);
            setEditingPartner(null);
          }}
        />
      )}
    </div>
  );
};

export default PartnerManager;
