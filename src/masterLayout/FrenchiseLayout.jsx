/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { fetchCounselor } from "../slice/CounselorManagerSlice";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { fetchTestemonial } from "../slice/testemonialsManagementSlice";
import logo from "../assets/SearchMyStudy.png";
import logo1 from "../assets/profile.png";


const FrenchiseLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const dispatch = useDispatch()
  const [counsellor, setCounsellor] = useState()
  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    // if(!token){
    //   navigate("/sign-in")
    // }

  }, [token, navigate, location.pathname]);



  const loadCounsellors = async () => {
    const res = await dispatch(fetchTestemonial());
    // console.log(res.payload, "}}}}}}}}}}}}}}}}}}}}}}}}]");
    if (res?.meta?.requestStatus === "fulfilled") {
      setCounsellor(res.payload);
    }
  };

  //  const navigate = useNavigate();

  const handleProfileClick = () => {
    // Remove token
    Cookies.remove("token");
    // Optional: redirect to home or sign-in page
    navigate("/sign-in");
  };

  useEffect(() => {
    loadCounsellors()
  }, [])

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link to='/' className='sidebar-logo'>
            <img
              src={logo}
              alt='site logo'
              className='light-logo w-[40px]'
            />
            <img
              src={logo}
              alt='site logo'
              className=' dark-logo w-[40px]'
            />
            <img
              src={logo}
              alt='site logo'
              className='logo-icon w-[40px]'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li className='drodown bg-primary rounded ' >
              <NavLink to='/dashboard'>
                <Icon
                  icon='solar:home-smile-angle-outline'
                  className='menu-icon text-white'
                />
                <span className="text-white">Dashboard</span>
              </NavLink>

            </li>

            <p className="mt-12">User Management</p>

            <li>
              <NavLink
                to='/partener-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Partner Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/frenchise-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Frenchise Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/country-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Country Management</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/lead-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Assessment Management</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/student-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Student Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/file-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>File/Template Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/loan-lead-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Loan Leads</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/commission-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Commission Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/nav-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Nav Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/promotional-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Promotional Management</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/contact-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Contact Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/popup-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Popup Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/ticket-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Ticket</span>
              </NavLink>
            </li>


            <li>
              <NavLink
                to='/transaction-management'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Transaction Management</span>
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to='/counselor-manager'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Counselor Management</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/media-manager'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Media Management</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to='/video-manager'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Video Management</span>
              </NavLink>
            </li> */}

            {/* <li>
              <NavLink
                to='/abroad-study-manager'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Abroad Study</span>
              </NavLink>
            </li> */}

            {/* Abroad Study Dropdown */}
            {/*            
            <li className='dropdown'>
              <Link to='#'>
                <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                <span>MBBS Abroad Manager</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/mbss-country'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Country
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/mbbs-university'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    University
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/mbbs-course'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Course
                  </NavLink>
                </li>
              </ul>
            </li>


            <li className='dropdown'>
              <Link to='#'>
                <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                <span>Lead Management</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/website-leads'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Website Lead Management
                  </NavLink>
                </li>


              
                <li>
                  <NavLink
                    to='/webinar-lead'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Webinar Lead Management
                  </NavLink>
                </li>

                

                
              </ul>
            </li>

            
            <li className='dropdown'>
              <Link to='#'>
                <i className="ri-phone-line w-auto" />
                <span>Counselor Lead</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  {
                    counsellor?.map((ele) => {
                      return (
                        <NavLink
                          to={`/counsellor-lead/${ele?._id}`}
                          className={(navData) =>
                            navData.isActive ? "active-page" : ""
                          }>
                          <i className="ri-customer-service-2-line  w-auto" />
                          {ele?.name}
                        </NavLink>
                      )
                    })
                  }

                </li>
              </ul>
            </li>  */}


            {/* <li>
              <NavLink
                to='/contactus-lead'
                className={(navData) =>
                  navData.isActive ? "active-page" : ""
                }
              >
                <i className="ri-phone-line w-auto" />
                Contact Us Lead
              </NavLink>
            </li>*/}



            {/* <li>
              <NavLink
                to='/testemonials-manager'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Testemonials Management</span>
              </NavLink>
            </li>


            
            <li>
              <NavLink
                to='/study-in-india'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='material-symbols:map-outline'
                  className='menu-icon'
                />
                <span>Study India Management</span>
              </NavLink>
            </li> */}



            {/* <li className='dropdown'>
              <Link to='#'>
                <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                <span>Others</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/popup'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Popup Management
                  </NavLink>
                </li>


              
                <li>
                  <NavLink
                    to='/website-details'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
                    Website Details
                  </NavLink>
                </li>

                

                
              </ul>
            </li> */}




          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                <form className='navbar-search'>
                  {/* <input type='text' name='search' placeholder='Search' /> */}
                  {/* <Icon icon='ion:search-outline' className='icon' /> */}
                </form>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />

                {/* Language dropdown end */}

                {/* Message dropdown end */}

                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src={logo1}
                      alt='image_user'
                      className='w-50-px h-50-px object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          www.searchmystudy.com
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          Admin
                        </span>
                      </div>
                      <button type='button' className='hover-text-danger'>
                        <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Profile
                        </Link>
                      </li>


                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile'
                        >
                          <Icon icon='solar:lock-password-outline' />{" "}
                          <button
                            onClick={handleProfileClick}
                            className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
                          >
                            Logout
                          </button>

                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/email'
                        >
                          <Icon
                            icon='tabler:message-check'
                            className='icon text-xl'
                          />{" "}
                          Inbox
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/company'
                        >
                          <Icon
                            icon='icon-park-outline:setting-two'
                            className='icon text-xl'
                          />
                          Setting
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                          to='#'
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </Link>
                      </li> */}
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        {/* <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© 2025 WowDash. All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                Made by <span className='text-primary-600'>wowtheme7</span>
              </p>
            </div>
          </div>
        </footer> */}
      </main>
    </section>
  );
};

export default FrenchiseLayout;



















// <li>
// <NavLink
//   to='/loan-lead'
//   className={(navData) =>
//     navData.isActive ? "active-page" : ""
//   }
// >
//   Loan lead
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/query'
//   className={(navData) =>
//     navData.isActive ? "active-page" : ""
//   }
// >
//   <i className="ri-customer-service-2-line w-auto" />

//   Website Query
// </NavLink>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon
//     icon='solar:document-text-outline'
//     className='menu-icon'
//   />
//   <span>Components</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/typography'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />
//       Typography
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/colors'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Colors
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/button'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
//       Button
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/dropdown'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-lilac-600 w-auto' />{" "}
//       Dropdown
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/alert'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Alerts
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/card'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Card
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/carousel'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Carousel
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/avatar'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
//       Avatars
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/progress'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Progress bar
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/tabs'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Tab &amp; Accordion
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/pagination'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />
//       Pagination
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/badges'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Badges
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/tooltip'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-lilac-600 w-auto' />{" "}
//       Tooltip &amp; Popover
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/videos'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-cyan w-auto' />{" "}
//       Videos
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/star-rating'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-indigo w-auto' />{" "}
//       Star Ratings
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/tags'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-purple w-auto' />{" "}
//       Tags
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/list'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-red w-auto' />{" "}
//       List
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/calendar'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-yellow w-auto' />{" "}
//       Calendar
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/radio'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-orange w-auto' />{" "}
//       Radio
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/switch'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-pink w-auto' />{" "}
//       Switch
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/image-upload'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Upload
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon icon='heroicons:document' className='menu-icon' />
//   <span>Forms</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/form'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Input Forms
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/form-layout'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Input Layout
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/form-validation'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
//       Form Validation
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/wizard'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Form Wizard
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon icon='mingcute:storage-line' className='menu-icon' />
//   <span>Table</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/table-basic'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Basic Table
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/table-data'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Data Table
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon icon='solar:pie-chart-outline' className='menu-icon' />
//   <span>Chart</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/line-chart'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Line Chart
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/column-chart'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Column Chart
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/pie-chart'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
//       Pie Chart
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li>
// <NavLink
//   to='/widgets'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon icon='fe:vector' className='menu-icon' />
//   <span>Widgets</span>
// </NavLink>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon
//     icon='flowbite:users-group-outline'
//     className='menu-icon'
//   />
//   <span>Users</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/users-list'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Users List
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/users-grid'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Users Grid
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/add-user'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Add User
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/view-profile'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       View Profile
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li className='dropdown'>
// <Link to='#'>
//   <i className='ri-user-settings-line' />
//   <span>Role &amp; Access</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/role-access'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Role &amp; Access
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/assign-role'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Assign Role
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li className='sidebar-menu-group-title'>Application</li>

// <li className='dropdown'>
// <Link to='#'>
//   <Icon icon='simple-line-icons:vector' className='menu-icon' />
//   <span>Authentication</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/sign-in'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Sign In
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/sign-up'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Sign Up
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/forgot-password'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Forgot Password
//     </NavLink>
//   </li>
// </ul>
// </li>



// <li className='dropdown'>
// <Link to='#'>
//   <Icon
//     icon='flowbite:users-group-outline'
//     className='menu-icon'
//   />
//   <span>Gallery</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/gallery-grid'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Gallery Grid
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/gallery'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Gallery Grid Desc
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/gallery-masonry'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Gallery Grid
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/gallery-hover'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Gallery Hover Effect
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li>
// <NavLink
//   to='/pricing'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon
//     icon='hugeicons:money-send-square'
//     className='menu-icon'
//   />
//   <span>Pricing</span>
// </NavLink>
// </li>



// <li className='dropdown'>
// <Link to='#'>
//   <Icon
//     icon='flowbite:users-group-outline'
//     className='menu-icon'
//   />
//   <span>Blog</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/blog'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Blog
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/blog-details'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Blog Details
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/add-blog'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Add Blog
//     </NavLink>
//   </li>
// </ul>
// </li>

// <li>
// <NavLink
//   to='/testimonials'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon
//     icon='mage:message-question-mark-round'
//     className='menu-icon'
//   />
//   <span>Testimonials</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/faq'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon
//     icon='mage:message-question-mark-round'
//     className='menu-icon'
//   />
//   <span>FAQs.</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/error'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon icon='streamline:straight-face' className='menu-icon' />
//   <span>404</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/terms-condition'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <Icon icon='octicon:info-24' className='menu-icon' />
//   <span>Terms &amp; Conditions</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/coming-soon'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <i className='ri-rocket-line menu-icon'></i>
//   <span>Coming Soon</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/access-denied'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <i className='ri-folder-lock-line menu-icon'></i>
//   <span>Access Denied</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/maintenance'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <i className='ri-hammer-line menu-icon'></i>
//   <span>Maintenance</span>
// </NavLink>
// </li>
// <li>
// <NavLink
//   to='/blank-page'
//   className={(navData) => (navData.isActive ? "active-page" : "")}
// >
//   <i className='ri-checkbox-multiple-blank-line menu-icon'></i>
//   <span>Blank Page</span>
// </NavLink>
// </li>

// {/* Settings Dropdown */}
// <li className='dropdown'>
// <Link to='#'>
//   <Icon
//     icon='icon-park-outline:setting-two'
//     className='menu-icon'
//   />
//   <span>Settings</span>
// </Link>
// <ul className='sidebar-submenu'>
//   <li>
//     <NavLink
//       to='/company'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
//       Company
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/notification'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
//       Notification
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/notification-alert'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
//       Notification Alert
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/theme'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Theme
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/currencies'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Currencies
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/language'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Languages
//     </NavLink>
//   </li>
//   <li>
//     <NavLink
//       to='/payment-gateway'
//       className={(navData) =>
//         navData.isActive ? "active-page" : ""
//       }
//     >
//       <i className='ri-circle-fill circle-icon text-danger-main w-auto' />{" "}
//       Payment Gateway
//     </NavLink>
//   </li>
// </ul>
// </li>