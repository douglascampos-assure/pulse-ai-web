export default function CustomSpinner({ text = "Loading..." }) {
  return (
    <section className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-700 border-t-transparent mx-auto mb-3"></div>
        <p className="text-slate-700 font-medium text-sm">{text}</p>
      </div>
    </section>
  );
}
