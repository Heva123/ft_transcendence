import ProtectedImage from "./ProtectedImage";

type Props = {
  username: string;
  avatarUrl?: string | null;
  className?: string;
  alt?: string;
};

function UserAvatar({
  username,
  avatarUrl,
  className,
  alt = "",
}: Props) {
  const initials = username
    .slice(0, 2)
    .toUpperCase();

  const defaultAvatar = (
    <ProtectedImage
      src="/default-avatar"
      alt={alt}
      className={className}
      fallback={initials}
    />
  );

  if (!avatarUrl) {
    return defaultAvatar;
  }

  return (
    <ProtectedImage
      src={avatarUrl}
      alt={alt}
      className={className}
      fallback={defaultAvatar}
    />
  );
}

export default UserAvatar;
