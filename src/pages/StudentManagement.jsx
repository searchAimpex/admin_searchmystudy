import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";
import LeadManager from "../components/LeadManager";
import StudentManager from "../components/StudentManager";

const StudentManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Partner Details'/>   

    {/* WebinarManager */}
    <StudentManager/>
    </FrenchiseLayout>
    </>
  );
};

export default StudentManagement;
