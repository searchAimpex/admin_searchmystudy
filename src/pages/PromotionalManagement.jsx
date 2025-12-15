
import Breadcrumb from "../components/Breadcrumb";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

import CommissionManager from "../components/CommissionManager";
import NavManager from "../components/NavManager";
import PromotionalManager from "../components/PromotionalManager";

const PromotionalManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* WebinarManager */}
    <PromotionalManager/>
    </FrenchiseLayout>
    </>
  );
};

export default PromotionalManagement;
