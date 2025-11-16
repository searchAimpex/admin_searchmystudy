import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";
import FrenchiseManager from "../components/FrenchiseManager";

const FrechiseManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Frenchise Details'/>   

    {/* WebinarManager */}
    <FrenchiseManager/>
    </FrenchiseLayout>
    </>
  );
};

export default FrechiseManagement;
