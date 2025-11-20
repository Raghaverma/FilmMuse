import { Film } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/5 bg-[#0a0a0a] text-sm text-neutral-500"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            <span className="text-xs">© {new Date().getFullYear()} FilmMuse, Inc.</span>
          </div>
          
          {/* TMDb Attribution */}
          <div className="flex flex-col items-center gap-2 text-xs text-neutral-500">
            <p className="text-center">
              This product uses the TMDb API but is not endorsed or certified by TMDb.
            </p>
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Visit TMDb website"
            >
              <Image
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDb Logo"
                width={130}
                height={20}
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

