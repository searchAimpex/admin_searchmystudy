import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5";

import JSZip from "jszip";
window.JSZip = JSZip;
import { Link } from "react-router-dom";


import { saveAs } from "file-saver";
import { Icon } from "@iconify/react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLead, FetchAssessment } from "../slice/AssessmentSlice";
import CreateLead from "../form/CreateLead";
import AssissmentStatus from "../form/AssissmentStatus";
import { toast } from "react-toastify";

const LeadManager = () => {
  const dispatch = useDispatch();
  const { assessment } = useSelector((state) => state.assessment);

  const tableRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    await dispatch(FetchAssessment());
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DATATABLE INIT ================= */
  useEffect(() => {
    if (!assessment?.length) return;

    if ($.fn.DataTable.isDataTable("#dataTable")) {
      $("#dataTable").DataTable().destroy();
    }

    tableRef.current = $("#dataTable").DataTable({
      paging: true,
      searching: true,
      pageLength: 5,
      lengthMenu: [5, 10, 20, 50],
      dom: "Bfrtip",
      buttons: [
        {
          extend: "excelHtml5",
          title: "Lead_Report",
        },
      ],
    });

    return () => {
      tableRef.current?.destroy();
    };
  }, [assessment]);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedIds.length) {
      toast.warning("Select at least one lead");
      return;
    }

    if (!window.confirm("Are you sure you want to delete?")) return;

    await dispatch(deleteLead(selectedIds));
    toast.success("Deleted successfully");
    fetchData();
    setSelectedIds([]);
  };

  /* ================= DOWNLOAD DOCUMENTS ================= */
  const handleDownloadDocuments = async (ele) => {
    const toastId = toast.loading("Preparing documents...");

    try {
      const zip = new JSZip();
      const folder = zip.folder(ele.trackingId || "Documents");

      const documents = {
        acadmics: ele.acadmics,
        englishTestDoc: ele.englishTestDoc,
        englishTestScorecard: ele.englishTestScorecard,
        qualifiedTestImage: ele.qualifiedTestImage,
        resume: ele.resume,
        workExperienceDoc: ele.workExperienceDoc,
      };

      const availableDocs = Object.entries(documents).filter(
        ([_, url]) => url
      );

      if (!availableDocs.length) {
        toast.update(toastId, {
          render: "No documents available",
          type: "warning",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      await Promise.all(
        availableDocs.map(async ([name, url]) => {
          const res = await fetch(url);
          const blob = await res.blob();

          const extMatch = url.match(/\.(\w+)(\?|$)/);
          const ext = extMatch ? extMatch[1] : "file";

          folder.file(`${name}.${ext}`, blob);
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${ele.trackingId}_Documents.zip`);

      toast.update(toastId, {
        render: "Documents downloaded successfully 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

    } catch (error) {
      console.error(error);

      toast.update(toastId, {
        render: "Download failed ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        <h5>Lead Manager</h5>

        <div>
          <button
            className="btn btn-success mx-2"
            onClick={() =>
              tableRef.current?.button(".buttons-excel").trigger()
            }
          >
            Download Excel
          </button>

          <button
            className="btn btn-primary mx-2"
            onClick={() => setShowModal(true)}
          >
            Create Lead
          </button>

          <button
            className="btn btn-danger mx-2"
            onClick={handleDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="card-body">
      <table
  className="
    // table
    // table-bordered
    // table-hover
    // table-striped
    // align-middle
    text-nowrap
    mb-0
  "
>

                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tracking ID</th>
                            <th>Student Name</th>
                            <th>Role</th>
                            <th>Country</th>
                            <th>Course</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>DOB</th>
                            <th>Center Code</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...assessment].reverse().map((ele) => (
                            <tr key={ele._id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.includes(ele._id)}
                                        onChange={() =>
                                            setSelectedIds((prev) =>
                                                prev.includes(ele._id)
                                                    ? prev.filter(
                                                          (id) =>
                                                              id !== ele._id
                                                      )
                                                    : [...prev, ele._id]
                                            )
                                        }
                                    />
                                </td>

                                <td>{ele.trackingId}</td>
                                <td>
                                    {ele.firstName} {ele.lastName}
                                </td>
                                <td>{ele?.User?.role}</td>
                                <td>{ele?.Country?.name || "—"}</td>
                                <td>{ele.Course}</td>
                                <td>{ele.emailID}</td>
                                <td>{ele.mobileNumber}</td>
                                <td>{ele.dob}</td>
                                <td>{ele?.User?.CenterCode}</td>
                                <td>{ele.status}</td>
                                <td>
                                    {new Date(
                                        ele.createdAt
                                    ).toLocaleDateString()}
                                </td>

                                <td>
                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-success"
                                        onClick={() => {
                                            setEditingWebinar(ele);
                                            setShowModal(true);
                                        }}
                                    >
                                        <Icon icon="lucide:edit" />
                                    </Link>

                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-primary mx-2"
                                        onClick={() => {
                                            setEditingWebinar(ele);
                                            setShowStatusModal(true);
                                        }}
                                    >
                                        <Icon icon="lucide:edit" />
                                    </Link>

                                    {/* ===== ADDED DOWNLOAD BUTTON ===== */}
                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-danger"
                                        onClick={() =>
                                            handleDownloadDocuments(ele)
                                        }
                                    >
                                        <Icon icon="lucide:download" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
      </div>

      {showModal && (
        <CreateLead
          ele={editingWebinar}
          fetchData={fetchData}
          handleClose={() => setShowModal(false)}
        />
      )}

      {showStatusModal && (
        <AssissmentStatus
          ele={editingWebinar}
          fetchData={fetchData}
          handleClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};

export default LeadManager;
