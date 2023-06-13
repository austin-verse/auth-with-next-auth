import { useRef, useState } from "react";
import classes from "./auth-form.module.css";
import { signIn } from "next-auth/client";
import { useRouter } from "next/router";
// 사용자 생성 함수
async function CreateUser(email, password) {
	const response = await fetch("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Something wrong");
	}
	return data;
}

function AuthForm() {
	const router = useRouter();
	const emailInputRef = useRef();
	const passwordInputRef = useRef();
	// 로그인인지 회원가입인지
	const [isLogin, setIsLogin] = useState(true);

	function switchAuthModeHandler() {
		setIsLogin((prevState) => !prevState);
	}

	// 회원가입 & 로그인 핸들러
	async function submitHandler(event) {
		event.preventDefault();
		const enteredEmail = emailInputRef.current.value;
		const enteredPassword = passwordInputRef.current.value;
		// optional: Validation
		if (isLogin) {
			// signIn은 프로미스 항상 resolve, 에러가 발생하면 내용 result.error가 null이 아닌 무언가 발생
			const result = await signIn("credentials", {
				redirect: false,
				email: enteredEmail,
				password: enteredPassword,
			});
			console.log(result);
			// 에러가 발생하지 않았을 시 (error = null)
			if (!result.error) {
				// replace는 현재 URL를 다른 URL로 바꿔줌
				// 새로고침 없음
				router.replace("/profile");
			}

			// 로그인 하기
		} else {
			// 회원가입
			try {
				const result = await CreateUser(enteredEmail, enteredPassword);
				console.log(result);
			} catch (error) {
				console.log(error);
			}
		}
	}

	return (
		<section className={classes.auth}>
			<h1>{isLogin ? "Login" : "Sign Up"}</h1>
			<form onSubmit={submitHandler}>
				<div className={classes.control}>
					<label htmlFor="email">Your Email</label>
					<input type="email" id="email" ref={emailInputRef} required />
				</div>
				<div className={classes.control}>
					<label htmlFor="password">Your Password</label>
					<input
						type="password"
						id="password"
						ref={passwordInputRef}
						required
					/>
				</div>
				<div className={classes.actions}>
					<button>{isLogin ? "Login" : "Create Account"}</button>
					<button
						type="button"
						className={classes.toggle}
						onClick={switchAuthModeHandler}
					>
						{isLogin ? "Create new account" : "Login with existing account"}
					</button>
				</div>
			</form>
		</section>
	);
}

export default AuthForm;
