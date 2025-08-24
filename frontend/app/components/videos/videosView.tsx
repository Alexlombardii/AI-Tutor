export function VideosView() {
    return (
      <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Educational Videos
        </h1>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎥</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            3Blue1Brown Style Videos Coming Soon
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            AI-generated educational videos in the style of 3Blue1Brown. 
            Complex concepts explained with beautiful animations and clear narration.
          </p>
        </div>
      </div>
    )
  }