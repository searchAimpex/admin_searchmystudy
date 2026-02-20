import React, { useEffect, useState, useMemo } from "react";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import TicketStatus from "../form/TicketStatus";
import {
  deleteCounselorCoursefinder,
  fetchCoursefinderCounselor,
} from "../slice/CounselorManagerSlice";
import CreateCounselor from "../form/CreateCounselor";
import Createtestemonial from "../form/CreateTestemonials";
import CreateCounsellorCoursefinder from "../form/CreateCounsellorCoursefinder";
import { deleteInformation, fetchInformation } from "../slice/UsefullInfocatiion";
import UsefullInformation from "../form/UsefullInformation";

/* ================= HELPERS ================= */
const renderValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return <span style={{ color: "red", fontWeight: 600 }}>EMPTY</span>;
  }
  return value;
};

const normalize = (val) =>
  val ? val.toString().toLowerCase().trim() : "";

/* ================= COMPONENT ================= */
const UsefullManagement = () => {
  const dispatch = useDispatch();
  const {information} = useSelector(state=>state?.information)
  // console.log(data,"+++++++++++++++++")

  /* ================= REDUX ================= */
  // const information = useSelector(
  //   (state) => state.counsellors?.information || []
  // );

  /* ================= STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    counsellorCode: "",
    role: "",
    centerCode: "",
    name: "", // ✅ NEW FILTER
  });

  /* ================= FETCH ================= */
  const loadData = async () => {
    const data = await dispatch(fetchInformation());
    console.log(data,"+++++++++++++++++")
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= FILTER LOGIC ================= */
  // const filteredCounsellors = useMemo(() => {
  //   return courseFinderCounsellor.filter((ele) => {
  //     const counsellorCode = normalize(ele?.CounsellorCOde);
  //     const role = normalize(ele?.createdBy?.role);
  //     const centerCode = normalize(ele?.createdBy?.CenterCode);
  //     const name = normalize(ele?.name); // ✅ NEW

  //     const fCounsellorCode = normalize(filters.counsellorCode);
  //     const fRole = normalize(filters.role);
  //     const fCenterCode = normalize(filters.centerCode);
  //     const fName = normalize(filters.name); // ✅ NEW

  //     const matchCounsellorCode =
  //       !fCounsellorCode || counsellorCode.includes(fCounsellorCode);

  //     const matchRole = !fRole || role === fRole;

  //     const matchCenterCode =
  //       !fCenterCode || centerCode.includes(fCenterCode);

  //     const matchName =
  //       !fName || name.includes(fName); // ✅ NEW

  //     return (
  //       matchCounsellorCode &&
  //       matchRole &&
  //       matchCenterCode &&
  //       matchName // ✅ NEW
  //     );
  //   });
  // }, [courseFinderCounsellor, filters]);

  /* ================= CHECKBOX ================= */
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(
      checked ? filteredCounsellors.map((c) => c._id) : []
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const idsToDelete = id ? [id] : selectedIds;

    if (!idsToDelete.length) {
      toast.warn("No counselor selected");
      return;
    }

    if (
      !window.confirm(
        idsToDelete.length > 1
          ? `Delete ${idsToDelete.length} counselors?`
          : "Delete this counselor?"
      )
    )
      return;

    const res = await dispatch(deleteInformation(idsToDelete));
    console.log(res,"+++++++++++++++++")
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Deleted successfully");
      setSelectedIds([]);
      loadData();
    } else {
      toast.error("Delete failed");
    }
  };

  /* ================= EXCEL DOWNLOAD ================= */
  // const downloadExcel = () => {
  //   const data = filteredCounsellors.map((ele, index) => ({
  //     "#": index + 1,
  //     Owner: ele?.createdBy?.OwnerName || "",
  //     CounsellorName: ele?.name || "",
  //     CounsellorCode: ele?.CounsellorCOde || "",
  //     Role: ele?.createdBy?.role || "",
  //     Email: ele?.email || "",
  //     Password: ele?.passwordTracker || "",
  //     CenterCode: ele?.createdBy?.CenterCode || "",
  //     CenterName: ele?.createdBy?.name || "",
  //     CreatedAt: ele?.createdAt || "",
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Counsellors");

  //   const blob = new Blob(
  //     [
  //       XLSX.write(workbook, {
  //         bookType: "xlsx",
  //         type: "array",
  //       }),
  //     ],
  //     {
  //       type:
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     }
  //   );

  //   saveAs(blob, "Counsellor_List.xlsx");
  // };

  /* ================= UI ================= */
  return (
    <div className="card basic-data-table">
      <div className="card-header d-flex justify-content-between">
        <h5>Counselor Management</h5>
        <button
                        className="btn btn-primary mx-2"
                        onClick={() => setShowModal(true)}
                    >
                        Create Transaction
                    </button>
        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm"
          //  onClick={downloadExcel}
          >
            Download Excel
          </button>

          {selectedIds.length > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete()}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
   

      {/* TABLE */}
      <div className="card-body overflow-x-auto">
        <table className="table bordered-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>#</th>
              <th>Title</th>
              <th>Frenchise</th>
              <th>Partner</th>
              <th>Icon Link</th>
              <th>Image Link</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {[...information].reverse().map((ele, i) => (
              <tr key={ele._id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.includes(ele._id)}
                    onChange={() => handleCheckboxChange(ele._id)}
                  />
                </td>
                <td>{i + 1}</td>
                <td>{ele?.title}</td>
                <td>{ele?.target?"Available":"Unavailable"}</td>
                <td>{ele?.target1?"Available":"Unavailable"}</td>
                <td>
                  <a href={ele?.iconURL} target="_blank">Link</a>
                </td>
                <td>
                  <a  target="_blank" href={ele?.imageURL}>Link</a>
                </td>
                  <td>{ele?.createdAt}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setEditingCounsellor(ele);
                      setShowModal(true);
                    }}
                  >
                    <Icon icon="lucide:edit" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UsefullInformation
          ele={editingCounsellor}
          fetchData={loadData}
          handleClose={() => {
            setShowModal(false);
            setEditingCounsellor(null);
          }}
        />
      )}
    </div>
  );
};

export default UsefullManagement;
