import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import { getSession } from "@auth0/nextjs-auth0";
// import myimg from "../Assets/Images/main.jpeg";
// import Image from "next/image";

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
      <div className=" flex h-screen flex-col lg:flex-row">
        {/* Left Section */}
        <div className="flex-none bg-blue-900/60 text-center lg:flex lg:w-3/5 lg:flex-col lg:items-center">
          <div className="w-full flex-none flex-col">
            <div className="flex flex-row justify-between">
              <div className="bg-custom m-3 justify-start font-serif text-3xl  font-bold  text-white">
                OpenAI
              </div>
              <Link
                href="/api/auth/signup"
                className="border-gradient m-2 flex flex-row rounded-md border-2 px-5"
              >
                <div className="flex flex-col justify-center">
                  <p className="font-serif font-bold ">Try ChatGPT</p>
                </div>
                <span className="my-2 text-xl"> &#8599;</span>
              </Link>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex flex-row justify-center font-serif">
              <div>
                <h1 className="bg-custom sm: text-5xl font-bold sm:my-5 md:my-5">
                  ChatGPT  <span className="text-5xl">●</span>
                </h1>
                <p className="bg-custom my-4  font-bold sm:my-5">
                  We’ve trained a model called ChatGPT which interacts in a{" "}
                  <br></br>
                  conversational way. The dialogue format makes it possible for
                  <br></br>ChatGPT to answer followup questions, admit its
                  mistakes,<br></br> challenge incorrect premises, and reject
                  <br></br>
                  inappropriate<br></br> requests.
                </p>
              </div>{" "}
              {/* <Image src={myimg} alt="my image" width={420} height={420} /> */}
            </div>
          </div>
          <div className="flex-none sm:my-5">
            <span className=" font-serif  underline">Terms of Use</span> |{" "}
            <span className=" font-serif underline ">Privacy Policy</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 justify-center bg-blue-950/20 text-center lg:w-2/5 lg:flex-col lg:items-center">
          <div className="text-white">
            <div className="bg-custom mb-4 font-serif text-4xl font-extralight sm:my-5 ">
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
                    className="border-gradient m-2 flex flex-row rounded-md border-2 px-5"
                  >
                    <div className="flex flex-col justify-center ">
                      <p className="font-serif">Log in</p>
                    </div>
                    <span className="my-2 text-2xl"> &#8599;</span>
                  </Link>
                  <Link
                    href="/api/auth/signup"
                    className="border-gradient m-2 flex flex-row rounded-md border-2 px-5"
                  >
                    <div className="flex flex-col justify-center">
                      <p className="font-serif">Sign Up</p>
                    </div>
                    <span className="my-2 text-2xl"> &#8599;</span>
                  </Link>
                </>
              )}
            </div>
            <div className="">
              <div className="mb-2"></div>
              <div className="text-sm"></div>
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
