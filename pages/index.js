import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import { getSession } from "@auth0/nextjs-auth0";

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
      <div className="flex min-h-screen w-full items-center  justify-center bg-gray-800 text-center text-white">
        <div className="text-center text-cyan-500">Welcome</div>
        <div className="">
          {!!user && <Link href="/api/auth/logout">Logout</Link>}

          {!user && (
            <>
              <Link
                href="/api/auth/login"
                className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
              >
                Login
              </Link>
              <Link
                href="/api/auth/signup"
                className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
              >
                SignUp
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);
  if (!!session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};
