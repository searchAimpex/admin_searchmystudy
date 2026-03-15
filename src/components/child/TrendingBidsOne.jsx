import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFrenchise, fetchPartner } from "../../slice/PartnerSlice";
import { FetchStudent } from "../../slice/StudentSlice";

const TrendingBidsOne = () => {
  const partners = useSelector((state) => state.partner.partner || []);
  const franchise = useSelector((state) => state.partner.frenchise || []);
  const { student = [] } = useSelector((state) => state.student || {});

    
  const getWeekRange = (offset = 0) => {
  const now = new Date();

  // Start of current week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1 - offset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};
const calculateWeeklyGrowth = (data = []) => {
  const { startOfWeek, endOfWeek } = getWeekRange(0);
  const { startOfWeek: lastStart, endOfWeek: lastEnd } = getWeekRange(1); 

  const thisWeekCount = data.filter(
    (item) =>
      item.createdAt &&
      new Date(item.createdAt) >= startOfWeek &&
      new Date(item.createdAt) <= endOfWeek
  ).length;

  const lastWeekCount = data.filter(
    (item) =>
      item.createdAt &&
      new Date(item.createdAt) >= lastStart &&
      new Date(item.createdAt) <= lastEnd
  ).length;

  if (lastWeekCount === 0) {
    return {
      thisWeekCount,
      lastWeekCount,
      percentage: thisWeekCount > 0 ? 100 : 0,
    };
  }

  const percentage = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;

  return {
    thisWeekCount,
    lastWeekCount,
    percentage: Number(percentage.toFixed(2)),
  };
};

  return (
    <div className='col-12'>
      <h6 className='mb-16'>Trending Bids</h6>
      <div className='row gy-4'>
        {/* Dashboard Widget Start */}
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-3'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='solar:users-group-rounded-bold' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{student.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                     Total Frenchise
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Widget End */}
        {/* Dashboard Widget Start */}
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-5'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-tie' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{partners.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Block Frenchise
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-danger-focus px-6 py-2 rounded-2 fw-medium text-danger-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-down-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Widget End */}
        {/* Dashboard Widget Start */}
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:office-building' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                     Unblock Freanchise
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:bank-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Current Monthly Frenchise
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:domain' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Total Partners
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
     
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:briefcase-account' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Block Partners
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:chart-box-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Unblock Partners
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:clipboard-text-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Current Monthly Partners
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Total Students
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Completed Students
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Rejecteded Students
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                    Inprogress Students
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Total Assessments
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Completed Assessments
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                      Rejecteded Assessments
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
          <div className='card px-24 py-16 shadow-none radius-12 border h-100 bg-gradient-start-2'>
            <div className='card-body p-0'>
              <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                <div className='d-flex align-items-center flex-wrap gap-16'>
                  <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6 mb-0'>
                    <Icon icon='mdi:account-group-outline' className='icon' />
                  </span>
                  <div className='flex-grow-1'>
                    <h6 className='fw-semibold mb-0'>{franchise.length}</h6>
                    <span className='fw-medium text-secondary-light text-md'>
                    Inprogress  Assessments
                    </span>
                    <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                      <span className='bg-success-focus px-6 py-2 rounded-2 fw-medium text-success-main text-sm d-flex align-items-center gap-8'>
                        +168.001%
                        <i className='ri-arrow-up-line' />
                      </span>{" "}
                      This week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Widget End */}
      </div>
    </div>
  );
};

export default TrendingBidsOne;
