import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";

import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteWebinar, fetchWebinar } from "../slice/webinarSlice";
import CreateWebinar from "../form/CreateWebinar";
import { toast } from "react-toastify";
import { fetchPartner } from "../slice/PartnerSlice";
import CreatePartner from "../form/CreatePartner";
import { fetchCountry } from "../slice/CountrySlicr";
import CreateCountryDocs from "../form/CreateCountryDocs";

const CountryManager = () => {
  const dispatch = useDispatch();
  const webinars  = useSelector((state) => state.country.country);
  console.log(webinars);
  

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  const fetchData = async () => {
    const a = await dispatch(fetchCountry());
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

      // Send array of IDs to API
      await dispatch(deleteWebinar(selectedIds));

      toast.success("Selected webinar(s) deleted successfully");
      setSelectedIds([]);
      fetchData()
      dispatch(fetchWebinar());
    } catch (error) {
      console.log(error);
      toast.error("Error deleting webinar(s)");
    }
  };

  return (
    <div className="card basic-data-table">
      <div
        className="card-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h5 className="card-title mb-0">Partner Table</h5>
        <div>
          <button
            type="button"
            className="mx-4 btn rounded-pill text-primary radius-8 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            Add Partner
          </button>

          <button
            className="mx-4 btn rounded-pill text-danger radius-8 px-4 py-2"
            onClick={handleDelete}
          >
            Delete Selected
          </button>

          {showModal && (
            <CreateCountryDocs
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
        <th>Name</th>
        <th>Code</th>
        <th>Faq</th>
        <th>Flag URL</th>
        <th>Why This Country</th>
        <th>VFS</th>
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
          <td>{ele?.code}</td>
          <td>
            <a target="_blank" href={ele?.faq}>Link</a>
          </td>
          <td> 
            <a target="_blank" href={ele?.falgURL}>Link</a>
          </td>
          <td>
                <a target="_blank" href={ele?.whyThisCountry}>Link</a>

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

export default CountryManager;
