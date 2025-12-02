import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-900">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          href="/admin/proposals"
          className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition-all group"
        >
          <h2 className="text-xl font-semibold mb-2 text-green-900 group-hover:text-green-700">
            Voorstellen beoordelen
          </h2>
          <p className="text-green-700">
            Bekijk en beoordeel ingediende activiteiten
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition-all group"
        >
          <h2 className="text-xl font-semibold mb-2 text-green-900 group-hover:text-green-700">
            Alle activiteiten beheren
          </h2>
          <p className="text-green-700">
            Bewerk, verwijder of kopieer activiteiten
          </p>
        </Link>
      </div>
    </div>
  );
}
