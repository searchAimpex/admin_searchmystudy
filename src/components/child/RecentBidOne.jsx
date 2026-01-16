import { useSelector } from "react-redux";

const RecentBidOne = () => {

  const { student = [] } = useSelector((state) => state.student || {});
console.log(student)

  return (
    <div className='col-12'>
      <div className='card h-100'>
        <div className='card-body p-24'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between mb-20'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Recent Bid</h6>
            {/* <select
              className='form-select form-select-sm w-auto bg-base border text-secondary-light rounded-pill'
              defaultValue='All Items'
            >
              <option value='All Items'>All Items </option>
              <option value='New Item'>New Item</option>
              <option value='Trending Item'>Trending Item</option>
              <option value='Old Item'>Old Item</option>
            </select> */}
          </div>
          <div className='table-responsive scroll-sm'>
            <div className='table-responsive scroll-sm'>
              <table className='table bordered-table sm-table mb-0'>
                <thead>
                  <tr>
                    <th scope='col'>Name </th>
                    <th scope='col'>DOB</th>
                    <th scope='col'>Email </th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Tracking ID</th>
                    <th scope='col' className='text-center'>
                      Country
                    </th>
                  </tr>
                </thead>
                <tbody>
               
                  {
                    student?.slice(0,10).map((ele)=>{
                      return(
                           <tr>
                    <td>
                      <div className='d-flex align-items-center'>
                        <img
                          src={`${ele.photo}`}
                          alt='WowDash React Vite'
                          className='flex-shrink-0 me-12 w-40-px h-40-px rounded-circle me-12'
                        />
                        <div className='flex-grow-1'>
                          <h6 className='text-md mb-0 fw-semibold'>
                          {ele?.firstName}
                          </h6>
                          <span className='text-sm text-secondary-light fw-normal'>
                            {ele?.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{ele.dob}</td>
                    <td>{ele.emailID}</td>
                    <td>
                      <div className='d-flex align-items-center'>
                        
                        <div className='flex-grow-1'>
                          <h6 className='text-md mb-0 fw-semibold text-primary-light'>
                            {ele?.status}
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>{ele?.trackingId}</td>
                    <td>
                   {ele?.country}
                    </td>
                  </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentBidOne;
