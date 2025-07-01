import React from 'react';

type Props = {
  isWalking: boolean;
};

// DogWalkAnimationをfunction宣言で記述
function DogWalkAnimation({ isWalking }: Props) {
  const videoSrc = isWalking
    ? '/animations/walking-dog-2.mp4'
    : '/animations/dog-idle.mp4';

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-contain bg-white"
      />
    </div>
  );
}

export default DogWalkAnimation;
