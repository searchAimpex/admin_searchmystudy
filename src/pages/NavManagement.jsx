
import Breadcrumb from "../components/Breadcrumb";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

import CommissionManager from "../components/CommissionManager";
import NavManager from "../components/NavManager";

const NavManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* WebinarManager */}
    <NavManager/>
    </FrenchiseLayout>
    </>
  );
};

export default NavManagement;
