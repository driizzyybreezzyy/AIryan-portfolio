/**
 * The illustrated player avatar shown on the card (DOM fallback) and used as the
 * portrait source for the 3D card texture.
 *
 * It is backed by `public/avatar.svg`. To use a custom avatar, replace that one
 * file — an avatar-maker export, an AI-illustrated portrait, or a commissioned
 * vector. No code changes are needed.
 */
export default function PlayerAvatar({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/avatar.jpeg"
      width={220}
      height={220}
      alt="Avatar of Aryan Bhavsar in AIryan FC kit"
      draggable={false}
    />
  );
}
