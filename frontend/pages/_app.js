import "@/styles/globals.css";
import { AuthProvider } from "@/pages/utils/authcontext";
import Navigation from "@/pages/components/layout/user/Navigation";
import { useRouter } from "next/router";
import routes from "@/route/routes"; // Import your route config

export default function App({ Component, pageProps }) {
    const router = useRouter();

    // Define pages that SHOULD NOT have the Navigation layout
    const authPages = [
        routes.root,
        routes.login,
        routes.signup,
        routes.forget_password,
        routes.otp_verification,
        routes.new_password,
    ].map(route => route.toLowerCase()); // Convert to lowercase for consistency

    // Convert pathname to lowercase for comparison
    const isAuthPage = authPages.includes(router.pathname.toLowerCase());

    return (
        <AuthProvider>
            {isAuthPage ? (
                <Component {...pageProps} />
            ) : (
                <Navigation>
                    <Component {...pageProps} />
                </Navigation>
            )}
        </AuthProvider>
    );
}
