import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";
import CountryManager from "../components/CountryManager.jsx";

const CountryManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='Country Details'/>   

    {/* WebinarManager */}
    <CountryManager/>
    </FrenchiseLayout>
    </>
  );
};

export default CountryManagement;
