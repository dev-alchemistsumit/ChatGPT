import Link from "next/link";

export const ChatSidebar = () => {
  return (
    <div className="text-white">
      ChatSidebar
      <div className="bg-red-600 text-center">
        <Link href="/api/auth/logout">Logout</Link>
      </div>
    </div>
  );
};
