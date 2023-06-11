// 인증과 관련된 유틸리티 메서드 정의

// 같은 비밀번호를 hashing해도 다른 값이 나옴 - 이럴 때 compare를 사용
// compare는 plain text 비밀번호가 해싱된 비밀번호와 일치하는지 확인해줌
import { hash, compare } from "bcryptjs";

export async function hashPassword(password) {
	// hash를 호출하여 1번째 인자로 비밀번호를 넣고 두번째 인자로 Salt의 Round값을 넣음
	// 2번째 인자는 암호화 정도를 결정하는 값으로 숫자가 작을수록 보안성이 떨어지지만 숫자가 클수록 함수 처리 완료가 오래 걸림
	const hashedPassword = await hash(password, 12);
	return hashedPassword;
}

// plain text PW와 hashing된 PW를 비교하여 Boolean값 리턴
export async function verifyPassword(password, hashedPassword) {
	const isValid = await compare(password, hashedPassword);
	return isValid;
}
