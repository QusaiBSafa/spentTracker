import AuthForm from "@/components/AuthForm";
import { login } from "../auth-actions";

export default function LoginPage() {
  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      action={login}
      switchText="No account yet?"
      switchHref="/register"
      switchLabel="Register"
    />
  );
}
