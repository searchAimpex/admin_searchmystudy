import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { FetchTransaction, deleteTransaction } from "../slice/transaction";
import CreateTransaction from "../form/CreateTransaction";

const TransactionManagement = () => {
    const dispatch = useDispatch();
    const { transaction } = useSelector((state) => state.transaction);

    const [filterTransactionID, setFilterTransactionID] = useState("");
    const [filterCenterCode, setFilterCenterCode] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // ✅ Fetch data
    useEffect(() => {
        dispatch(FetchTransaction());
    }, [dispatch]);

    // ✅ Filtering logic (SAFE)
    const filteredTransaction = transaction?.filter((item) => {
        const matchTransactionID = filterTransactionID
            ? item?.transactionID
                  ?.toLowerCase()
                  .includes(filterTransactionID.toLowerCase())
            : true;

        const matchCenterCode = filterCenterCode
            ? item?.centerCode
                  ?.toLowerCase()
                  .includes(filterCenterCode.toLowerCase())
            : true;

        return matchTransactionID && matchCenterCode;
    });



    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ✅ Delete
    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            toast.warning("Select at least one transaction");
            return;
        }

        if (!window.confirm("Delete selected transactions?")) return;

        const res = await dispatch(deleteTransaction(selectedIds));

        toast.success("Deleted successfully");
        setSelectedIds([]);
        dispatch(FetchTransaction());
    };

    return (
        <div className="card">
            {/* HEADER */}
            <div className="card-header d-flex justify-content-between">
                <h5>Transaction Management</h5>

                <div>
                    <button
                        className="btn btn-primary mx-2"
                        onClick={() => setShowModal(true)}
                    >
                        Create Transaction
                    </button>

                    <button
                        className="btn btn-danger mx-2"
                        onClick={handleDelete}
                    >
                        Delete Selected
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filter by Transaction ID"
                            value={filterTransactionID}
                            onChange={(e) =>
                                setFilterTransactionID(e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filter by Center Code"
                            value={filterCenterCode}
                            onChange={(e) =>
                                setFilterCenterCode(e.target.value)
                            }
                        />
                    </div>

                    <div className="col-md-2">
                        <button
                            className="btn btn-secondary w-100"
                            onClick={() => {
                                setFilterTransactionID("");
                                setFilterCenterCode("");
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                           <tr>
                                <th>#
                                    {/* <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            filteredTransaction.length > 0 &&
                                            selectedIds.length ===
                                                filteredTransaction.length
                                        }
                                    /> */}
                                </th>
                                <th>Center Code</th>
                                <th>Invoice</th>
                                <th>Other</th>
                                <th>Receipt</th>
                                <th>Remarks</th>
                                <th>Transaction Date</th>
                                <th>Transaction ID</th>
                                <th>Mode</th>
                                <th>Created At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTransaction?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center text-danger fw-bold"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                filteredTransaction?.map((ele) => (
                                     <tr key={ele._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                              className="form-check-input"
                                            checked={selectedIds.includes(
                                                ele._id
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(ele._id)
                                            }
                                        />
                                    </td>
                                    <td>{ele?.centerCode}</td>
                                    <td>
                                        <a
                                            href={ele?.invoice}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Link
                                        </a>
                                    </td>
                                    <td>
                                        <a
                                            href={ele?.other}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Link
                                        </a>
                                    </td>
                                    <td>
                                        <a
                                            href={ele?.receipt}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Link
                                        </a>
                                    </td>
                                    <td>{ele?.remarks}</td>
                                    <td>{ele?.transactionDate}</td>
                                    <td>{ele?.transactionID}</td>
                                    <td>{ele?.transactionMode}</td>
                                    <td>
                                        {ele?.createdAt
                                            ? new Date(
                                                  ele.createdAt
                                              ).toLocaleDateString()
                                            : "—"}
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <CreateTransaction
                    fetchData={() => dispatch(FetchTransaction())}
                    handleClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default TransactionManagement;
