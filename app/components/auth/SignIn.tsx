import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../auth.module.scss";
import { IconButton } from "../button";
import Locale from "../../locales";
import { useNavigate } from "react-router-dom";
import { Path } from "../../constant";

export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type SignInFormData = {
  email: string;
  password: string;
};

export const SignIn = () => {
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    const { email, password } = data;
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.error) {
      console.error("Error signing in");
    }
  };

  const onSignup = async (data: SignInFormData) => {
    const { email, password } = data;
    const res = await supabase.auth.signUp({ email, password });
    if (res.error) {
      console.error("Error signing up", res.error);
    } else {
      setSignUpSuccess(true);
    }
  };

  if (signUpSuccess)
    return (
      <div className={styles["auth-signup-success"]}>
        {Locale.Auth.SignUpSuccess}
      </div>
    );
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className={styles["auth-inputs"]}>
        <>
          <input
            placeholder="Email"
            type="email"
            {...register("email")}
            className={styles["auth-input"]}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </>
        <>
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className={styles["auth-input"]}
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </>
      </div>
      <div>
        <div className={styles["auth-actions"]}>
          <IconButton
            text={Locale.Auth.Confirm}
            type="primary"
            onClick={handleSubmit(onSubmit)}
          />
          <IconButton text={"Sign Up"} onClick={handleSubmit(onSignup)} />
        </div>
      </div>
    </form>
  );
};
