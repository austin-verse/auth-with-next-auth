import { useRef, useState } from "react";
import classes from "./auth-form.module.css";
import { signIn } from "next-auth/client";
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
	const emailInputRef = useRef();
	const passwordInputRef = useRef();
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
			const result = await signIn("credentials", {
				redirect: false,
				email: enteredEmail,
				password: enteredPassword,
			});
			console.log(result);
			// 로그인 하기
		} else {
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
