import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-gray-900 to-black font-sans min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white tracking-tighter">Skool So Fly</h1>
          <p className="text-gray-400 text-lg mt-2">Premium School Supplies</p>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-white">
            Everything You Need for School Success
          </h2>
          <p className="max-w-md text-lg leading-8 text-gray-400">
            Quality school supplies at unbeatable prices. Sign up or log in to get started with your shopping!
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-500 md:w-[158px]"
            href="/role-select"
          >
            <span>Shop Now</span>
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-gray-600 px-5 transition-colors hover:border-gray-400 hover:bg-gray-900 text-white md:w-[158px]"
            href="/login"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
