import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../../utils/supabaseClient";
import * as yup from "yup";
import { useRouter } from "next/router";
import { userState } from "@/state";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const signUpSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type SignUpFormData = {
  email: string;
  password: string;
};

export const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
  });

  const router = useRouter();
  const setUser = useSetRecoilState(userState);

  const onSubmit = async (data: SignUpFormData) => {
    const { email, password } = data;
    const res = await supabase.auth.signUp({ email, password });
    if (res.error) {
      console.error("Error signing up", res.error);
    } else {
      setUser(res.data.user);
      router.push("/dashboard");
    }
  };

  return (
    <>
      <div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-lg mx-auto w-full"
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full h-10 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-200 p-2 rounded text-sm text-center"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>
          <div>
            <input
              placeholder="Password"
              type="password"
              {...register("password")}
              className="mt-2 w-full h-10 bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-200 p-2 rounded text-sm rounded-md text-center"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 mx-auto w-full my-3"
          >
            Sign Up
          </button>
        </form>
      </div>
      <p className="text-center text-gray-500">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-indigo-500 hover:underline"
        >
          Sign In
        </button>
      </p>
    </>
  );
};

export default SignUp;
