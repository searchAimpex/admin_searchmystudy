
import Breadcrumb from "../components/Breadcrumb";

import TicketManagement from "../components/TicketManagement";
import TransactionManagement from "../components/TransactionManagement";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const TransactionManagements = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* CounselorManager */}
    <TransactionManagement/>
    </FrenchiseLayout>
    </>
  );
};

export default TransactionManagements;
