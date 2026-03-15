import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";

const TrendingBidsOne = () => {

  const partners = useSelector((state) => state.partner.partner || []);
  const franchise = useSelector((state) => state.partner.frenchise || []);
  const { student = [] } = useSelector((state) => state.student || {});

  const dashboardCards = [
    {
      section: "User Record",
      cards: [
        { title: "Total Partner Associate", value: partners.length, icon: "solar:users-group-rounded-bold" },
        { title: "Active Partner Associate", value: partners.length, icon: "mdi:account-check" },
        { title: "Inactive Partner Associate", value: partners.length, icon: "mdi:account-off" },

        { title: "Total Franchise Associate", value: franchise.length, icon: "mdi:office-building" },
        { title: "Active Franchise Associate", value: franchise.length, icon: "mdi:domain" },
        { title: "Inactive Franchise Associate", value: franchise.length, icon: "mdi:domain-off" },

        { title: "Total Counsellor Onboard", value: 0, icon: "mdi:account-tie" },
        { title: "Active Counsellor", value: 0, icon: "mdi:account-check-outline" },
        { title: "Inactive Counsellor", value: 0, icon: "mdi:account-remove-outline" },
      ],
    },

    {
      section: "Assessment Profile Record",
      cards: [
        { title: "Total Assessment", value: 0, icon: "mdi:clipboard-text-outline" },
        { title: "Eligible Assessment", value: 0, icon: "mdi:check-circle-outline" },
        { title: "Pending Assessment", value: 0, icon: "mdi:clock-outline" },
        { title: "Ineligible Assessment", value: 0, icon: "mdi:close-circle-outline" },
      ],
    },

    {
      section: "Applied Student Record",
      cards: [
        { title: "Total Applied Student", value: student.length, icon: "mdi:account-group-outline" },
        { title: "Offer Letter Issued Student", value: 0, icon: "mdi:email-outline" },
        { title: "Visa Approved Student", value: 0, icon: "mdi:passport" },
        { title: "Fee Paid Student", value: 0, icon: "mdi:currency-inr" },
        { title: "Admission Completed Student", value: 0, icon: "mdi:check-circle" },
        { title: "Cancelled Student", value: 0, icon: "mdi:close-circle" },
      ],
    },

    {
      section: "Loan Lead Record",
      cards: [
        { title: "Total Loan Lead", value: 0, icon: "mdi:bank-outline" },
        { title: "Applied Loan Lead", value: 0, icon: "mdi:file-document-outline" },
        { title: "Approved Loan Lead", value: 0, icon: "mdi:check-decagram" },
        { title: "Rejected Loan Lead", value: 0, icon: "mdi:close-octagon" },
      ],
    },
  ];

  return (
    <div className="col-12">

      {dashboardCards.map((section, i) => (
        <div key={i} className="mb-32">

          {/* Section Heading */}
          <h5 className="fw-bold mb-20">{section.section}</h5>

          <div className="row">
            {section.cards.map((card, index) => (
              <div key={index} className='col-xxl-3 mt-12 col-xl-3 col-lg-4 col-md-6 col-sm-6'>
                <div className='card px-24 py-16  shadow-none radius-12 border h-100 bg-gradient-start-5'>
                  <div className='card-body p-0 '>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1'>
                      <div className='d-flex align-items-center flex-wrap gap-16'>

                        <span className='mb-0 w-40-px h-40-px bg-primary-600 flex-shrink-0 text-white d-flex justify-content-center align-items-center rounded-circle h6'>
                          <Icon icon={card.icon} className='icon' />
                        </span>

                        <div className='flex-grow-1'>
                          <h6 className='fw-semibold mb-0'>{card.value}</h6>

                          <span className='fw-medium text-secondary-light text-md'>
                            {card.title}
                          </span>

                          <p className='text-sm mb-0 d-flex align-items-center flex-wrap gap-12 mt-12'>
                            <span className='bg-danger-focus px-6 py-2 rounded-2 fw-medium text-danger-main text-sm d-flex align-items-center gap-8'>
                              +168.001%
                              <i className='ri-arrow-down-line' />
                            </span>
                            This week
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}

    </div>
  );
};

export default TrendingBidsOne;