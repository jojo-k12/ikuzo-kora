import React from 'react';
import {Composition} from 'remotion';
import {KitschIntro} from './KitschIntro';
import {KitschMontage, MONTAGE_FRAMES} from './montage/KitschMontage';
import {FPS, T} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KitschIntro"
      component={KitschIntro}
      durationInFrames={T.end}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="KitschMontage"
      component={KitschMontage}
      durationInFrames={MONTAGE_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
