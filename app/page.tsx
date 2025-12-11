import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans ">
      <div className="text-center space-y-6">
        <p className="text-3xl">You got fishing attacked! 🎣
        </p>
        
        <div className="border-t pt-6">
          <div className="space-y-3">
            <Link 
              href="/user-data" 
              className="block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              🎣 See What Data Can Be Collected
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
