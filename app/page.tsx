import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans ">
          <p className="text-3xl">You got fishing attack, please click here to 
            get more information <Link className="text-blue-500 hover:underline" href="/here">Here</Link></p>
    </div>
  );
}
