import ProfileForm from "./profile-form";
import classes from "./user-profile.module.css";
import { getSession, useSession } from "next-auth/client";
import { useState, useEffect } from "react";

function UserProfile() {
	// Redirect away if NOT auth
	// 인증되지 않았을 떄 (로그인이 안되어있는데 접근하거나, 접근중 로그아웃했을 때)
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		// 세션이 없으면 session = null - 로그인이 되어있지 않는 상태
		// 세션이 있으면 세션 데이터가 있는 객체 생성 - 로그인 되어있는 상태
		getSession().then((session) => {
			// 세션이 없다면 로그인 / 회원가입 페이지로 이동
			console.log(session);
			if (!session) {
				window.location.href = "/auth";
			} else {
				// session이 있다면(로그인이 되어있다면) 로딩 종료
				// 세션 값이 필요하다면 session객체에서 사용
				setIsLoading(false);
			}
		});
	}, []);
	if (isLoading) {
		return <p className={classes.profile}>Loading...</p>;
	}
	return (
		<section className={classes.profile}>
			<h1>Your User Profile</h1>
			<ProfileForm />
		</section>
	);
}

export default UserProfile;
