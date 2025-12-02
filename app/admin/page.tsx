import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6 text-gray-900">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          href="/admin/proposals"
          className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-200 hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-accent via-green-600 to-emerald-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-gray-900 group-hover:text-emerald-700">
              Voorstellen beoordelen
            </h2>
          </div>
          <p className="text-gray-600 pl-[4.5rem]">
            Bekijk en beoordeel ingediende activiteiten
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-200 hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-accent via-green-600 to-emerald-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-gray-900 group-hover:text-emerald-700">
              Alle activiteiten beheren
            </h2>
          </div>
          <p className="text-gray-600 pl-[4.5rem]">
            Bewerk, verwijder of kopieer activiteiten
          </p>
        </Link>
      </div>
    </div>
  );
}
