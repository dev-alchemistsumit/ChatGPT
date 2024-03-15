import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Head from "next/head";

export default function Home() {
  const { isLoading, error, user } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <Head>
        <title>Bitgpt-Login or SignUp</title>
      </Head>
      <div className="min-h-screen w-full items-center justify-center bg-gray-800 text-center text-white">
        <div className="">asd</div>
        {!!user && <Link href="/api/auth/logout">Logout</Link>}
        {!user && <Link href="/api/auth/login">Login</Link>}
      </div>
    </>
  );
}
