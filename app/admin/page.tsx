import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          href="/admin/proposals"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Voorstellen beoordelen
          </h2>
          <p className="text-gray-600">
            Bekijk en beoordeel ingediende activiteiten
          </p>
        </Link>

        <Link
          href="/admin/events"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Alle activiteiten beheren
          </h2>
          <p className="text-gray-600">
            Bewerk, verwijder of kopieer activiteiten
          </p>
        </Link>
      </div>
    </div>
  );
}
