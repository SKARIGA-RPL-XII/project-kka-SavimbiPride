import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000",
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 ||
      err.response?.data?.forceLogout
    ) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default instance;