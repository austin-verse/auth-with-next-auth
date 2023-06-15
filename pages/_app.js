import { Provider } from "next-auth/client";
import Layout from "../components/layout/layout";
import "../styles/globals.css";
function MyApp({ Component, pageProps }) {
	// 이미 가지고 있을 수도 있는 session 데이터 설정
	console.log("pagePRopssgtart");
	console.log(pageProps);
	console.log("end");
	return (
		<Provider session={pageProps.session}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</Provider>
	);
}

export default MyApp;
