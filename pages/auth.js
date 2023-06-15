import { getSession } from "next-auth/client";
import AuthForm from "../components/auth/auth-form";
import { useEffect, useState } from "react";

function AuthPage() {
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		getSession().then((session) => {
			if (session) {
				window.location.href = "/profile";
			} else {
				setIsLoading(false);
			}
		});
	}, []);
	if (isLoading) {
		return <p>loading</p>;
	}
	return <AuthForm />;
}

export default AuthPage;

// export async function getServerSideProps(context) {
// 	const session = await getSession({ req: context.req });
// 	if (session) {
// 		return {
// 			redirect: {
// 				destination: "/profile",
// 				permanent: false,
// 			},
// 		};
// 	}
// 	return {
// 		props: {
// 			session: session,
// 		},
// 	};
// }
