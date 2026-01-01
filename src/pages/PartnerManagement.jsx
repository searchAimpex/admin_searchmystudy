import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WebinarManager from "../components/WebinarManager";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";
import PartnerManager from "../components/PartnerManager";

const PartnerManagement = () => {
  return (
    <>
      {/* masterLayout */}
      <FrenchiseLayout>
        {/* BreadCrumb */}
        <Breadcrumb title='Partner Details' />

        {/* WebinarManager */}
        <PartnerManager />
      </FrenchiseLayout>
    </>
  );
};

export default PartnerManagement;
