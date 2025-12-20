
import Breadcrumb from "../components/Breadcrumb";
import ContactManagerr from "../components/ContactManager";

import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const ContactManagement = () => {
  return (
    <>
    {/* masterLayout */}
    <FrenchiseLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='File Details'/>   

    {/* WebinarManager */}
    <ContactManagerr/>
    </FrenchiseLayout>
    </>
  );
};

export default ContactManagement;
