import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import MbbsCountryManager from '../components/MbbsCountryManager'

const MbbsStudyPage = () => {
  return (
   <>
   <MasterLayout>
    {/* BreadCrumb */}
    <Breadcrumb title='MBBS Study' />
    <MbbsCountryManager/>
   </MasterLayout>
   </>
  )
}

export default MbbsStudyPage