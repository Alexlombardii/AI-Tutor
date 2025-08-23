interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative w-full">
      {/* Main input container - ChatGPT style */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Plus icon on the left */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        {/* Text input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything"
          rows={1}
          className="w-full px-12 py-4 pr-20 resize-none border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-base leading-6"
          disabled={disabled}
          style={{ minHeight: '56px', maxHeight: '200px' }}
        />
        
        {/* Right side icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
          {/* Microphone icon */}
          <div className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          
          {/* Send button */}
          <button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}