import { hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

export default async function Handler(req, res) {
	// POST요청일 시에만 작동
	if (req.method !== "POST") {
		return;
	}
	// 요청에서 보내는 데이터 추출
	const data = req.body;
	const { email, password } = data;

	// 이메일 유효성 체크
	// 유효성이 패스하지 않았을 때 422에러를 보낸 후 return
	if (
		!email ||
		!email.includes("@") ||
		!password ||
		password.trim().length < 7
	) {
		res.status(422).json({
			message:
				"Invalid input - password should also be at least 7 characters long.",
		});
		return;
	}
	// 유효성 체크 패스 시
	// DB에서 생성한 클러스터를 어플리케이션에 연결
	const client = await connectToDatabase();
	// DB에 접근
	const db = client.db();

	// 비밀번호 암호화 전 DB에서 같은 이메일을 가진 사용자 찾기 - 만약 중복되는 이메일로 가입을 시도하면 가입 거절
	// 사용자를 찾으면 사용자 가입 정보의 객체 반환, 찾지 못하면 undefined 반환
	const existingUser = await db.collection("users").findOne({ email: email });
	if (existingUser) {
		res.status(422).json({ message: "User exists already!" });
		// 데이터 베이스 연결 닫음
		client.close();
		return;
	}

	// 비밀번호 암호화
	const hashedPassword = await hashPassword(password);

	// 콜렉션에 접근 - 없을 시 새로 자동생성됨
	db.collection("users").insertOne({
		email: email,
		password: hashedPassword,
	});

	// 처리가 완료되었을 시
	res
		.status(201)
		.json({ message: "User Created!", email: email, pw: hashedPassword });
	client.close();
}
