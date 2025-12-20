
import Breadcrumb from "../components/Breadcrumb";
import ContactManagerr from "../components/ContactManager";
import PopupManagement from "../components/PopupManagement";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const PopupManagements = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* WebinarManager */}
    <PopupManagement/>
    </FrenchiseLayout>
    </>
  );
};

export default PopupManagements;
