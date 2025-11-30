export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Inloggen bij DaCapo Jaarplanner
        </h1>
        <p className="text-gray-600 mb-4">
          Authenticatie wordt later geïmplementeerd met Supabase Auth of Azure AD.
        </p>
        <p className="text-sm text-gray-500">
          Voor nu word je automatisch ingelogd als test-gebruiker.
        </p>
      </div>
    </div>
  );
}
