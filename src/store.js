import { configureStore } from '@reduxjs/toolkit';
import blogReducer from './slice/blogSlice';
import webinarReducer from './slice/webinarSlice';
import videoReducer from './slice/VideoSlice';
import mediaReducer from './slice/MediaSlice';
import authReducer from './slice/authSlice';
import serviceReducer from './slice/serviceSlice';
import testemonialReducer from './slice/testemonialsManagementSlice'
import abroadReducer from './slice/AbroadSlice'
import AbroadProvinceReducer from './slice/AbroadProvinceSlice'
import AbroadUniversityReducer from './slice/AbroadUniversitySlice'
import abroadCourseReducer from './slice/AbroadCourseSlice'
import mbbsReducer from './slice/MbbsSlice'
import mbbsUniversityReducer from './slice/mbbsUniversity'
import mbbsCourseReducer from './slice/MbbsCourse'
import contactUsLeadReducer from './slice/contachUsLead'
import counsellorLeadReducer from './slice/counsellorLead'
import queryReducer from './slice/QuerySlice'
import profileReducer from './slice/profileSlice'
import partnerSliceReducer from './slice/PartnerSlice'
import countrySliceReducer from './slice/CountrySlicr'
import assessmentSliceReducer from './slice/AssessmentSlice'
import studentSliceReducer from './slice/StudentSlice'
import loanLeadSliceReducer from './slice/loanLead'
import ComissionSliceReducer from './slice/comission'
import NavSliceReducer from './slice/nav'
import PromotionalSliceReducer from './slice/promotional'
import ContactSliceReducer from './slice/contact'
import TicketSliceReducer from './slice/ticket'
import transactionReducer from './slice/transaction'
import counsellorReducer from './slice/CounselorManagerSlice'
import { Nav } from 'react-bootstrap';
const store = configureStore({
  reducer: {
      blog: blogReducer,
      webinar:webinarReducer,
      video:videoReducer,
      media:mediaReducer,
      auth:authReducer,
      service:serviceReducer,
      testemonial:testemonialReducer,
      abroadStudy:abroadReducer,
      abroadProvince:AbroadProvinceReducer,
      abroadUniversity:AbroadUniversityReducer,
      abroadCourse: abroadCourseReducer,
      mbbsStudy: mbbsReducer,
      mbbsUniversity:mbbsUniversityReducer, 
      mbbsCourse:mbbsCourseReducer, 
      contactUsLead:contactUsLeadReducer, 
      counsellorLead:counsellorLeadReducer, 
      query:queryReducer, 
      profile:profileReducer,
      partner:partnerSliceReducer,
      country:countrySliceReducer  ,
      assessment:assessmentSliceReducer,
      student:studentSliceReducer,
      loan:loanLeadSliceReducer,
      comission:ComissionSliceReducer,
      nav:NavSliceReducer,
      promotional:PromotionalSliceReducer,
      contact:ContactSliceReducer,
      ticket:TicketSliceReducer,
      transaction:transactionReducer,
      counsellors:counsellorReducer
  },
 
});

export default store;
