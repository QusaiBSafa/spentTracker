import AuthForm from "@/components/AuthForm";
import { register } from "../auth-actions";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Create account"
      submitLabel="Register"
      action={register}
      switchText="Already have an account?"
      switchHref="/login"
      switchLabel="Log in"
    />
  );
}
