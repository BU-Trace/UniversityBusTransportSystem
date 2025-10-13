import React from 'react';
import Image from 'next/image';

interface Props {
  image: string;
  width: number;
  height: number;
  alt: string;
}

const NextImage = ({ image, width, height, alt }: Props) => {
  return <Image width={width} height={height} src={image} alt={alt} />;
};

export default NextImage;
