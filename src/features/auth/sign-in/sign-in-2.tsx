"use client";

import { UserAuthForm } from "./components/user-auth-form";

export default function SignIn2() {
  return (
    <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full w-full flex-col items-center justify-center overflow-hidden bg-muted p-10 text-white dark:border-r lg:flex">
        <div
          className="absolute inset-0 animate-bg"
          style={{
            background: "linear-gradient(270deg, hsl(189, 100%, 25%), hsl(189, 100%, 35%), hsl(189, 100%, 45%))",
            backgroundSize: "400% 400%",
          }}
        />
        <img
          src="/images/logo_login.png"
          className="relative z-5 m-auto block"
          width={301}
          height={60}
          alt="Logo de Autenticação"
        />
      </div>

      <div className="flex items-center justify-center lg:p-8">
        <div className="mx-auto w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-lg sm:w-[350px]">
          <div className="mb-4 flex flex-col space-y-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Informe suas credenciais para acessar o sistema
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
