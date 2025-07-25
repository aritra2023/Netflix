
import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoPlayerProps {
  movieId: string;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer = ({ movieId, isOpen, onClose }: VideoPlayerProps) => {
  const [fallbackToNewTab, setFallbackToNewTab] = useState(false);

  const handleIframeError = () => {
    window.open(`https://vidsrc.to/embed/movie/${movieId}`, '_blank');
    setFallbackToNewTab(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        {/* Top Ad Slot */}
        <div className="w-full h-[90px] bg-netflix-gray mb-4 flex items-center justify-center">
          <span className="text-gray-400">Advertisement</span>
        </div>

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {!fallbackToNewTab && (
            <iframe
              src={`https://vidsrc.to/embed/movie/${movieId}`}
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
              onError={handleIframeError}
            />
          )}
        </div>

        {/* Bottom Ad Slot */}
        <div className="w-full h-[90px] bg-netflix-gray mt-4 flex items-center justify-center">
          <span className="text-gray-400">Advertisement</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
