import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../../utils/supabaseClient";
import { useState } from "react";
import styles from "../auth.module.scss";
import { IconButton } from "../button";
import Locale from "../../locales";
import { Modal } from "../ui-lib";

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
  const [showSignUp, setShowSignUp] = useState(false);
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
    <>
      <form className="">
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
            <IconButton text={"Sign Up"} onClick={() => setShowSignUp(true)} />
          </div>
        </div>
      </form>
      {showSignUp && (
        <div className="modal-mask">
          <Modal
            title="Sign Up for a Free Account"
            onClose={() => setShowSignUp(false)}
            maxWidth={500}
            removeMax={true}
          >
            {!signUpSuccess && (
              <form>
                <div className={styles["auth-inputs"]}>
                  <>
                    <input
                      placeholder="Email"
                      type="email"
                      {...register("email")}
                      className={styles["auth-input"]}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">
                        {errors.email.message}
                      </p>
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
                      <p className="text-red-500 text-xs">
                        {errors.password.message}
                      </p>
                    )}
                  </>
                </div>
                <div>
                  <div className={styles["auth-actions"]}>
                    <IconButton
                      text="Sign Up"
                      type="primary"
                      onClick={handleSubmit(onSignup)}
                    />
                  </div>
                </div>
              </form>
            )}
            {signUpSuccess && (
              <div className={styles["auth-signup-success"]}>
                {Locale.Auth.SignUpSuccess}
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};
