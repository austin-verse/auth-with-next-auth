import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";
export default NextAuth({
	// JWT가 생성되었는지 확인
	// 인증된 상요자에 대한 세션을 관리하는 방법을 구성할 수 있는 객체
	session: {
		// JWT쓰기 위해서 true
		// 기타 다른 인증 제공자의 경우 다른 방식으로 관리 : 세션은 DB에 저장
		// 이 제공자에 대한 크리덴셜 기반 인증인 경우 무조건 JWT: true
		// session 객체 내에 db를 지정하지 않으면 자동으로 JWT가 true가 됨 but 명시적인 설정도 좋음
		jwt: true,
	},

	providers: [
		// 고유의 크리덴셜을 제공하겠다는 뜻
		Providers.Credentials({
			// 크리덴셜이 뭔지 정의 : email과 PW
			// 그럼 NextAuth가 우리 대신 로그인 양식을 만들어줌
			// 이미 하나를 갖고 있기 때문에 크리덴셜을 생성하지 않음 : 지금은 NextAuth가 양식을 생성할 필요가 없음
			// credentials: {},

			// authorize메서드: 들어오는 로그인 요청을 NextJS가 수신할 때 NextJS가 우리 대신 호출해줌
			// async라 프로미스 반환, 제출된 크리덴셜을 인수로 받음
			// 크리덴셜: 우리가 제출한ㄷ ㅔ이터가 있는 객체 (email, pw 등)

			// authorize() 내부에서 에러가 발생하면 authorize()가 생성한 프로미스를 거부하고 기본적으로 클라이언트를 다른 페이지에 리다이렉션함 - 그 함수를 오버라이드하면 로그인페이지에 머물어서 에러 표시 가능
			async authorize(credentials) {
				// 여기에 고유의 인증 논리를 가져옴 - 크리덴셜이 유효한지 확인하고 아니라면 사용자에 알림
				// db연결
				const client = await connectToDatabase();
				// 입력한 이메일에 대한 사용자가 있는지 확인
				const usersCollection = client.db.collection("users");
				// Credential 에서 email프로퍼티를 찾음 -우리가 클라이언트 사이드에서 요청을 보낼 때 그 크리덴셜을 설정하는게 바로 우리기 때문
				const user = await usersCollection.findOne({
					email: credentials.email,
				});
				// 사용자가 없을 때
				if (!user) {
					client.close();
					throw new Error("No user found!");
				}
				// 사용자가 있을 때 PW확인
				const isValid = await verifyPassword(
					credentials.password,
					user.password
				);
				//비번이 틀렸을 때
				if (!isValid) {
					client.close();
					throw new Error("Password incorrect.");
				}

				// 이메일과 비밀번호가 일치할 때
				// Authorize()내부에 객체를 반환하여 NextAuth에 인증이 성공했다고 알릴 수 있음
				// return되는 객체를 JWT로 인코딩됨
				// 이메일을 포함시키지만 전체 user객체를 전달하지는 않음: 비밀번호를 포함시킬 수 없기 때문(해싱된 비밀번호라도 클라이언트에 노출 X)
				return { email: user.email };
			},
		}),
	],
});
// API라우트는 여전히 함수를 반환해야함
// 내보낸 handler()함수는 NextAuth()를 호출하여 NextAuth()에 의해 생성됨
// NextAuth()를 호출할 때 구성 객체를 전달할 수 있는데, 그 객체를 통해 NextAuth()의 동작을 구성할 수 있음

// Providers.~~()은 구성 객체 자체가 필요함
