import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteWebinar, fetchWebinar } from "../slice/webinarSlice";
import CreateWebinar from "../form/CreateWebinar";
import { toast } from "react-toastify";
import { deletePartner, fetchFrenchise, fetchPartner, updateStatus } from "../slice/PartnerSlice";
import CreatePartner from "../form/CreatePartner";
import CreateFrenchise from "../form/CreateFrenchise";

const FrenchiseManager = () => {
  const dispatch = useDispatch();

  // const webinars1  = useSelector((state) => state);
  // console.log(webinars1);
  
  const webinars  = useSelector((state) => state.partner.frenchise);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  const fetchData = async () => {
    const a = await dispatch(fetchFrenchise());
    // console.log(a)  
  };
  console.log(webinars)

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (webinars?.length > 0) {
      if ($.fn.DataTable.isDataTable("#dataTable")) {
        $("#dataTable").DataTable().destroy();
      }

      $("#dataTable").DataTable({
        paging: true,
        searching: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20, 50],
        columnDefs: [
          { targets: [1, 2], searchable: true }, // Title & Trainer Name searchable
          { targets: "_all", searchable: false },
        ],
      });
    }
  }, [webinars]);

  // ✅ Checkbox (single select/unselect)
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // ✅ Master checkbox (select/unselect all)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(webinars.map((w) => w._id));
    } else {
      setSelectedIds([]);
    }
  };

  // ✅ Delete selected webinars
  const handleDelete = async () => {
    try {
      if (selectedIds.length === 0) {
        toast.warning("Please select at least one webinar to delete.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedIds.length} webinar(s)?`
      );
      if (!confirmed) return;

      // console.log(selectedIds);
      const a = await dispatch(deletePartner(selectedIds));
      // console.log(a)

      toast.success("Selected User(s) deleted successfully");
      setSelectedIds([]);
      fetchData()
       await dispatch(fetchFrenchise());
    } catch (error) {
      console.log(error);
      toast.error("Error deleting webinar(s)");
    }
  };


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
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h5 className="card-title mb-0">Frenchise Table</h5>
        <div>
          <button
            type="button"
            className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Frenchise
          </button>

          <button
            className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2"
            onClick={handleDelete}
          >
            Delete Selected
          </button>

          {showModal && (
            <CreateFrenchise
              fetchData={fetchData}
              ele={editingWebinar}
              handleClose={() => {
                setShowModal(false);
                setEditingWebinar(null);
              }}
            />
          )}
        </div>
      </div>

     <div className="card-body overflow-x-auto">
  <table id="dataTable" className="table bordered-table mb-0">
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
      {webinars?.map((ele, ind) => (
        <tr key={ele._id || ind}>
          <td>
            <div className="form-check style-check d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedIds.includes(ele._id)}
                onChange={() => handleCheckboxChange(ele._id)}
              />
              <label className="form-check-label">{ind + 1}</label>
            </div>
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
              onClick={() => {
                setEditingWebinar(ele);
                setShowModal(true);
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

export default FrenchiseManager;
