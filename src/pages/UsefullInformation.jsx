
import Breadcrumb from "../components/Breadcrumb";
import CounselorManagement from "../components/CounselorManagement";
import UsefullManagement from "../components/UsefullManagement";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const UsefullInformation = () => {
  return (
    <>
   
    <FrenchiseLayout>
    <Breadcrumb title='File Details'/>   
      <UsefullManagement/>
    </FrenchiseLayout>
    </>
  );
};

export default UsefullInformation;
