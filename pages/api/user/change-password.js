import { getSession } from "next-auth/client";
import { connectToDatabase } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

export default async function handler(req, res) {
	// 사용자가 입력한 기존 비밀번호와 새 비밀번호를 추출하고 인증된 사용자가 보낸 전송이 맞는지 확인
	// 인증된 사용자가 아니면 반응 X
	// 1. 인증된 사용자의 이메일 주소를 가져와서 데이터베이스에 해당 사용자가 있는지 확인
	// 2. 입력한 기존 비밀번호가 데이터베이스에 저장된 현재 비밀번호와 일치하는지 확인
	// 3. 일치하다면 새 비밀번호로 바꿈

	// 사용할 메서드: POST, PUT, PATCH 중 PATCH
	// 이 3가지 요청 모두 서버의 리소스를 변경한다는 의미의 요청
	if (req.method !== "PATCH") {
		return;
	}

	// 인증된 사용자인지 확인
	// 서버사이드에선 getSession에 req키의 객체 전달 가능
	const session = await getSession({ req: req });
	// 세션 토큰 쿠키가 잇다면 유효성 검사 후  쿠키로부터 필요한ㄷ 데이터 추출
	// 인증된 사용자라면 session값이 있지만 없다면 빈 값

	// 인증된 사용자가 아닐 때 에러 반환
	// 이 코드로 인해 인증되지 않은 사용자의 API라우트 접근을 막음
	if (!session) {
		// 401: 인증되지 않음
		res.status(401).json({ message: "Not Authenticated" });
		return;
	}
	// 인증되었을 때

	// 세션에서 사용자 이메일 추출
	const userEmail = session.user.email;

	// req.body에서 사용자 기존 / 변경 비밀번호 추출
	const oldPassword = req.body.oldPassword;
	const newPassword = req.body.newPassword;

	// 데이터베이스에 연결해 이메일로 주소를 찾고, 사용자를 발견하면 기존 비밀번호가 일치하는지 확인
	// 비밀번호가 일치하면 새 비밀번호를 해싱하고 기존 비밀번호를 새 비밀번호로 변경
	const client = await connectToDatabase();
	const usersCollection = client.db().collection("users");
	const user = await usersCollection.findOne({ email: userEmail });

	// 세션과 일치하는 사용자를 찾기 못했을 시
	if (!user) {
		res.status(404).json({ message: "User not found." });
		client.close();
		return;
	}

	// 세션과 일치하는 사용자를 찾았을 시
	const currentPassword = user.password;
	const passwordAreEqaul = await verifyPassword(oldPassword, currentPassword);

	// DB의 비밀번호와 사용자가 입력한 현재 비밀번호가 틀렸을 때
	if (!passwordAreEqaul) {
		// 인증된 사용자는 401 코드 사용 X
		res.status(403).json({ message: "Invalid password." });
		client.close();
		return;
	}

	// 새로운 비번이 조건에 맞지 않을 때
	if (!newPassword || newPassword.trim().length < 7) {
		res.status(422).json({
			message:
				"Invalid input - password should also be at least 7 characters long.",
		});
		client.close();
		return;
	}

	// 모든 조건이 맞았을 때
	const hashedPassword = await hashPassword(newPassword);
	const result = await usersCollection.updateOne(
		{
			email: userEmail,
		},
		{ $set: { password: hashedPassword } }
	);
	client.close();
	res.status(200).json({ message: "Password updated." });
}
