import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerSeven from "../components/DashBoardLayerSeven";
import FrenchiseLayout from "../masterLayout/FrenchiseLayout";

const HomePageSeven = () => {
  return (
    <>
      {/* MasterLayout */}
      <FrenchiseLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='NFT & Gaming' />

        {/* DashBoardLayerSeven */}
        <DashBoardLayerSeven />
      </FrenchiseLayout>
    </>
  );
};

export default HomePageSeven;
