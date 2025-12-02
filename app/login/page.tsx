export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="bg-green-50 p-8 rounded-2xl shadow-sm border border-green-200 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-green-900">
          Inloggen bij DaCapo Jaarplanner
        </h1>
        <p className="text-green-700 mb-4">
          Authenticatie wordt later geïmplementeerd met Supabase Auth of Azure AD.
        </p>
        <p className="text-sm text-green-600">
          Voor nu word je automatisch ingelogd als test-gebruiker.
        </p>
      </div>
    </div>
  );
}
