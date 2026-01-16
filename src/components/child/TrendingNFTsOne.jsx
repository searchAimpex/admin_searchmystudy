import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCountry, fetchFile } from "../../slice/CountrySlicr";
import { useEffect, useState } from "react";

const TrendingNFTsOne = () => {
  const dispatch = useDispatch();
  const files = useSelector((state) => state.country?.file?.data || []);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [activeType, setActiveType] = useState("All");

  // Fetch data
  const fetchData = async () => {
    await dispatch(fetchCountry());
    await dispatch(fetchFile());
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Initialize filtered files
  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  // Get unique types for filter buttons
  const types = ["All", ...new Set(files.map((f) => f?.type).filter(Boolean))];

  // Handle type filter
  const handleFilter = (type) => {
    setActiveType(type);
    if (type === "All") {
      setFilteredFiles(files);
    } else {
      setFilteredFiles(files.filter((f) => f?.type === type));
    }
  };

  return (
    <div className="col-12">
      {/* Filter Buttons */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        {types.map((type, idx) => (
          <button
            key={idx}
            className={`btn rounded-pill px-3 py-1 ${
              activeType === type ? "btn-primary-600" : "btn-outline-primary"
            }`}
            onClick={() => handleFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="tab-content" id="pills-tab-threeContent">
        <div
          className="tab-pane fade show active"
          id="pills-button-all"
          role="tabpanel"
          aria-labelledby="pills-button-all-tab"
          tabIndex={0}
        >
          <div className="row g-3">
            {filteredFiles?.slice(0, 4).map((ele, index) => (
              <div className="col-xxl-3 col-sm-6 col-xs-6" key={ele?._id || index}>
                <div className="nft-card bg-base radius-16 overflow-hidden">
                  <div className="radius-16 overflow-hidden">
                    <img
                      src={ele?.template || "/placeholder.png"}
                      alt={ele?.name || "NFT"}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div className="p-10">
                    <h6 className="text-md fw-bold text-primary-light">
                      {ele?.name || "Unnamed NFT"}
                    </h6>
                    <div className="d-flex align-items-center gap-8">
                      <img
                        src={ele?.template || "/placeholder.png"}
                        className="w-28-px h-28-px rounded-circle object-fit-cover"
                        alt={ele?.name || "NFT"}
                      />
                      <span className="text-sm text-secondary-light fw-medium">
                        {ele?.type || "Unknown"}
                      </span>
                    </div>
                    <div className="mt-10 d-flex align-items-center justify-content-between gap-8 flex-wrap">
                      <span className="text-sm text-secondary-light fw-medium">
                        <b>Country:</b> {ele?.SecondCountry?.name || "N/A"}
                      </span>
                      <span className="text-sm fw-semibold text-primary-600">
                        {ele?.createdAt
                          ? new Date(ele.createdAt).toLocaleDateString("en-GB")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center flex-wrap mt-12 gap-8">
                      <Link
                        to="#"
                        className="btn rounded-pill border text-neutral-500 border-neutral-500 radius-8 px-12 py-6 bg-hover-neutral-500 text-hover-white flex-grow-1"
                      >
                        History
                      </Link>
                      <Link
                        to="#"
                        className="btn rounded-pill btn-primary-600 radius-8 px-12 py-6 flex-grow-1"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredFiles.length === 0 && (
              <p className="text-center text-secondary-light mt-4">
                No NFTs found for this filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingNFTsOne;
