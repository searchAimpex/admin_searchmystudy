import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function RedirectWrapper({ children }) {
  const navigate = useNavigate();
  const token = Cookies.get("token");
    console.log(token,"=================token===================");
//   useEffect(() => {
//     if (token) {
//       navigate("/dashboard");
//     } else {
//       navigate("/");
//     }
//   }, [token, navigate]);

  return children;
}
