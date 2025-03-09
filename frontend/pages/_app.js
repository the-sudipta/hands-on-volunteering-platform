import "@/styles/globals.css";
import {AuthProvider} from "@/pages/utils/authcontext";

export default function App({ Component, pageProps }) {
  return (
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
  );
}
