export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
      {message}
    </div>
  );
}
