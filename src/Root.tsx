import React from 'react';
import {Composition} from 'remotion';
import {KitschIntro} from './KitschIntro';
import {FPS, T} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="KitschIntro"
    component={KitschIntro}
    durationInFrames={T.end}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
