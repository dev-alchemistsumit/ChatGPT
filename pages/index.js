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
        <title>ChatGPT- Login or SignUp</title>
      </Head>
      <div className="flex h-screen flex-row  ">
        <div className="flex flex-1 basis-3/5 items-center justify-center bg-blue-900/60 text-center">
          <div className="text-5xl font-semibold text-white">
            ChatGPT  <span className="text-5xl">●</span>
          </div>
        </div>

        <div className="flex flex-1 basis-2/5 flex-col items-center justify-center bg-blue-950/20 text-center">
          <div>
            <div className="mb-4 text-4xl font-thin text-white">
              Get Started..
            </div>

            <div className="flex flex-row">
              {!!user ? (
                <Link href="/api/auth/logout" className="btn bg-green m-2 p-2">
                  Logout
                </Link>
              ) : (
                <>
                  <Link
                    href="/api/auth/login"
                    className="btn m-2 bg-blue-600 py-2 "
                  >
                    Login
                  </Link>
                  <Link
                    href="/api/auth/signup"
                    className="btn m-2  bg-blue-600 py-2"
                  >
                    SignUp
                  </Link>
                </>
              )}
            </div>
            <div className="">
              <div className="mb-2"></div>
              <div className="text-sm">
                {/* <span className="underline">Terms of Use</span> |{" "}
                <span className="underline">Privacy Policy</span> */}
              </div>
            </div>
          </div>
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
