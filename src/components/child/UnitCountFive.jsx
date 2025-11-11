import { Link } from "react-router-dom";
import useReactApexChart from "../../hook/useReactApexChart";

const UnitCountFive = ({ abroadUniversity, mbbsUniversity, overseaseCountry, mbbsCountry, counsellorLead }) => {
  let { createChartSix } = useReactApexChart();
  // console.log(overseaseCountry, '-----------------------------');

  return (
    <div className="row g-3">
      {/* Card 1 - Overseas Study Countries */}
      <div className="col-12 col-md-6 col-xl-4">
     <Link to="/abroad-country">
        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-1 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-pink text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-group-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                Total Overseas Study Countries
              </span>
            </div>
            <h5 className="fw-semibold mb-0">{overseaseCountry?.length}</h5>
          </div>
        </div>
     </Link>
      </div>

      {/* Card 2 - MBBS Study Countries */}
      <div className="col-12 col-md-6 col-xl-4">
        <Link to="/mbss-country">
         <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-2 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-purple text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-youtube-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                Total MBBS Study Countries
              </span>
            </div>
            <h5 className="fw-semibold mb-0">{mbbsCountry?.length}</h5>
          </div>
        </div>
        </Link>
       
      </div>

      {/* Card 3 - Leads */}
      <div className="col-12 col-md-6 col-xl-4">
        <Link tp="/counselor-manager">
        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-3 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-info text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-money-dollar-circle-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                Total Counselor Lead
              </span>
            </div>
            <h5 className="fw-semibold mb-0">{counsellorLead?.counsellorLeads?.length}</h5>
            <p className="text-sm mb-0">
              <span className="text-white px-1 rounded-2 fw-medium bg-success-main text-sm">
                {
                  overseaseCountry?.filter((item) => {
                    const createdAt = new Date(item.createdAt);
                    const now = new Date();
                    return (
                      createdAt.getMonth() === now.getMonth() &&
                      createdAt.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </span>{" "}
              This Month
            </p>
          </div>
        </div>
        </Link>
      </div>

      {/* Card 4 - MBBS Universities */}
      <div className="col-12 col-md-6 col-xl-4">
        <Link to="/mbbs-university"> 
        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-2 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-purple text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-youtube-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                Total Overseas Study Universities
              </span>
            </div>
            <h5 className="fw-semibold mb-0">{abroadUniversity?.length}</h5>
          </div>
        </div>
        </Link>
      </div>

      {/* Card 5 - Overseas Universities */}
      {/* <div > */}
      <Link className="col-12 col-md-6 col-xl-4" to="/abroad-university">

        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-1 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-pink text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-group-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                 Total MBBS Study Universities
              </span>
            </div>
            <h5 className="fw-semibold mb-0">{mbbsUniversity?.length}</h5>
          </div>
        </div>
      </Link>
      {/* </div> */}

      {/* Card 6 - Leads Duplicate */}
      
       <Link className="col-12 col-md-6 col-xl-4" to="/webinar-lead">
        <div className="card p-3 radius-8 shadow-none bg-gradient-dark-start-3 h-100">
          <div className="card-body p-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="w-48-px h-48-px bg-base text-info text-2xl d-flex justify-content-center align-items-center rounded-circle">
                <i className="ri-money-dollar-circle-fill" />
              </span>
              <span className="fw-medium text-secondary-light text-lg">
                Total Webinar Leads
              </span>
            </div>
           <div className="flex">
 <h5 className="fw-semibold mb-0">{counsellorLead?.counsellorLeads?.length}</h5>
            <p className="text-sm mb-0">
              <span className="text-white px-1 rounded-2 fw-medium bg-success-main text-sm">
                {
                  overseaseCountry?.filter((item) => {
                    const createdAt = new Date(item.createdAt);
                    const now = new Date();
                    return (
                      createdAt.getMonth() === now.getMonth() &&
                      createdAt.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </span>{" "}
              This Month
            </p>
           </div>
          </div>
        </div>
       </Link>
      {/* </div> */}
    </div>
  );
};

export default UnitCountFive;
