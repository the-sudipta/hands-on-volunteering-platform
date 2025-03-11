import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import API_ENDPOINTS from "@/route/api";
import routes from "@/route/routes";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("authUser");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  useEffect(() => {
    // Add interceptor on component mount
    const interceptor = axios.interceptors.request.use(
        config => {
          const storedUser = localStorage.getItem("authUser");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            config.headers.Authorization = `Bearer ${user.jwt}`;
          }
          return config;
        },
        error => {
          return Promise.reject(error);
        }
    );

    // Remove interceptor on component unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []); // Empty dependency array ensures this effect only runs once on component mount

  const login = (jwt, cookie) => {
    const newUser = { jwt, cookie };
    if (typeof window !== "undefined") {
      localStorage.setItem("authUser", JSON.stringify(newUser));
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    }
  };

  const checkUser = () => {
    return user && user.jwt != null && user.cookie != null;
  };

  const logout = () => {
    doSignOut();
  };

  async function doSignOut() {
    try {
      // ✅ Check if the user is already logged out to prevent 401 errors
      const storedUser = localStorage.getItem("authUser");
      if (!storedUser || storedUser === "null") {
        console.warn("User already logged out, skipping API request.");
      } else {
        // ✅ Only call the API if the user is still authenticated
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT + API_ENDPOINTS.userProfile,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              withCredentials: true,
            }
        );
        console.log(response);
      }

      // ✅ Clear session data safely
      localStorage.removeItem("authUser");
      setUser(null);
      document.cookie = null;
      delete axios.defaults.headers.common["Authorization"];
      await router.push(routes.login);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn("401 Unauthorized: User is already logged out.");
      } else {
        console.error("Logout error: ", error);
      }
    }
  }


  return (
      <AuthContext.Provider value={{ user, login, logout, checkUser }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
