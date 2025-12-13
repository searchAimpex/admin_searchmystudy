import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";
import LeadManager from "../components/LeadManager";
import StudentManager from "../components/StudentManager";
import FileManager from "../components/FileManager";
import LoanLeadManager from "../components/LoanLeadManager";
import CommissionManager from "../components/CommissionManager";

const CommissionManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* WebinarManager */}
    <CommissionManager/>
    </FrenchiseLayout>
    </>
  );
};

export default CommissionManagement;
