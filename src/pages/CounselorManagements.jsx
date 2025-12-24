
import Breadcrumb from "../components/Breadcrumb";
import CounselorManagement from "../components/CounselorManagement";

import TicketManagement from "../components/TicketManagement";
import TransactionManagement from "../components/TransactionManagement";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const CounselorManagements = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* CounselorManager */}
    <CounselorManagement/>
    </FrenchiseLayout>
    </>
  );
};

export default CounselorManagements;
