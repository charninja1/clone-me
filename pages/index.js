export default function SimpleIndex() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">CloneMe Email</h1>
        <p className="text-xl mb-8">AI-powered email generation</p>
        <div className="space-x-4">
          <a href="/login" className="bg-blue-500 text-white px-6 py-3 rounded">Login</a>
          <a href="/dashboard" className="bg-green-500 text-white px-6 py-3 rounded">Dashboard</a>
        </div>
      </div>
    </div>
  );
}