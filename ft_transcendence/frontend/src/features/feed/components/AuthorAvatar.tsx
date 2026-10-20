import UserAvatar from "../../../components/UserAvatar";

type AvatarUser = {
  username: string;
  avatarUrl?: string | null;
};

function AuthorAvatar({
  author,
  className,
}: {
  author: AvatarUser;
  className: string;
}) {
  return (
    <div className={className}>
      <UserAvatar
        username={author.username}
        avatarUrl={author.avatarUrl}
        className="author-avatar__img"
        alt={`${author.username}'s avatar`}
      />
    </div>
  );
}

export default AuthorAvatar;
