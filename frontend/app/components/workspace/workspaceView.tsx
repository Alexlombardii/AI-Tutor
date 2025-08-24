export function WorkspaceView() {
    return (
      <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Interactive Workspace
        </h1>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Drawing Canvas Coming Soon
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            This is where students and teachers will work through problems together 
            using an interactive drawing canvas. Touch, mouse, and stylus support 
            will be available.
          </p>
        </div>
      </div>
    )
  }