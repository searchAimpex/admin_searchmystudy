
import Breadcrumb from "../components/Breadcrumb";

import TicketManagement from "../components/TicketManagement";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const TicketManagements = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* CounselorManager */}
    <TicketManagement/>
    </FrenchiseLayout>
    </>
  );
};

export default TicketManagements;
