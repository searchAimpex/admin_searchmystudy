import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";
import LeadManager from "../components/LeadManager";

const LeadManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Partner Details'/>   

    {/* WebinarManager */}
    <LeadManager/>
    </FrenchiseLayout>
    </>
  );
};

export default LeadManagement;
