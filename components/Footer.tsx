import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800">
      <div className="container-max py-6 text-sm text-slate-500 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div>© {new Date().getFullYear()} Aditya More</div>
        <div className="flex gap-4 items-center">
          <a 
            href="https://github.com/Skywalker1910" 
            target="_blank" 
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity p-1"
            aria-label="GitHub"
          >
            <Image 
              src="/github.png" 
              alt="GitHub" 
              width={24} 
              height={24} 
              className="object-contain dark:hidden"
            />
            <Image 
              src="/github-white.png" 
              alt="GitHub" 
              width={24} 
              height={24} 
              className="object-contain hidden dark:block filter brightness-0 invert"
            />
          </a>
          <a 
            href="https://www.linkedin.com/in/more-aditya" 
            target="_blank" 
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity p-1"
            aria-label="LinkedIn"
          >
            <Image 
              src="/linkedin.png" 
              alt="LinkedIn" 
              width={24} 
              height={24} 
              className="object-contain dark:hidden"
            />
            <Image 
              src="/linkedin-white.png" 
              alt="LinkedIn" 
              width={24} 
              height={24} 
              className="object-contain hidden dark:block filter brightness-0 invert"
            />
          </a>
          <a 
            href="mailto:aditya.more@outlook.in"
            className="hover:opacity-70 transition-opacity p-1"
            aria-label="Email"
          >
            <Image 
              src="/email.png" 
              alt="Email" 
              width={24} 
              height={24} 
              className="object-contain dark:hidden"
            />
            <Image 
              src="/email-white.png" 
              alt="Email" 
              width={24} 
              height={24} 
              className="object-contain hidden dark:block filter brightness-0 invert"
            />
          </a>
          <a 
            href="https://www.instagram.com/aditya_more19" 
            target="_blank" 
            rel="noreferrer"
            className="hover:opacity-70 transition-opacity p-1"
            aria-label="Instagram"
          >
            <Image 
              src="/instagram.png" 
              alt="Instagram" 
              width={24} 
              height={24} 
              className="object-contain dark:hidden"
            />
            <Image 
              src="/instagram-white.png" 
              alt="Instagram" 
              width={24} 
              height={24} 
              className="object-contain hidden dark:block filter brightness-0 invert"
            />
          </a>
          <a href="/privacy" className="text-slate-500 hover:text-slate-400 transition-colors ml-2">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
