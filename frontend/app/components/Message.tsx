export default function Message({ content, isUser }: { content: string; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
      }`}>
        <div className="text-sm leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}