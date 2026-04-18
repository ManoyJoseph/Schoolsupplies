import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 tracking-tighter">Skool So Fly</h1>
          <p className="text-gray-600 text-lg mt-2">Point of Sale System</p>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-gray-900">
            Manage Your School Supply Store
          </h2>
          <p className="max-w-md text-lg leading-8 text-gray-600">
            Complete POS system for inventory management, sales tracking, and order processing. Sign in with your staff account to get started.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black px-5 text-white transition-colors hover:bg-gray-800 md:w-[158px]"
            href="/login"
          >
            <span>Staff Login</span>
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 px-5 transition-colors hover:bg-gray-50 text-gray-900 md:w-[158px]"
            href="/role-select"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
