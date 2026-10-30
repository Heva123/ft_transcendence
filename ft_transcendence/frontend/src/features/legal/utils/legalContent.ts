/*
  Privacy Policy and Terms of Service text.
  It describes what the app really stores and does. Update it if a
  feature changes what data is collected or where it is hosted.
*/
export type LegalSection = {
  heading: string
  paragraphs: string[]
}

export const LEGAL_UPDATED = '16 October 2026'

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: 'Who we are',
    paragraphs: [
      'PXL_LAB is a community platform built by four 42 Abu Dhabi students as the ft_transcendence project. It is a student project. It is not a commercial service and it does not sell anything.',
    ],
  },
  {
    heading: 'What we store',
    paragraphs: [
      'Account: your email address, username and password. Your password is never stored in plain text. It is saved as a salted bcrypt hash.',
      'Profile: your avatar image if you upload one, and the time you were last online.',
      'Content you create: posts, post images, replies, likes, chat messages, chat image attachments, communities you create and channels you add.',
      'Community data: which communities you belong to and your role in each one (owner, admin, moderator or member).',
      'Safety data: reports you send or review, and the list of people you have blocked.',
      'Notifications we create for you, and whether you have read them.',
    ],
  },
  {
    heading: 'Why we use it',
    paragraphs: [
      'We use this data only to run PXL_LAB: to sign you in, show your profile, deliver posts and messages, show who is online, count unread messages and notifications, and let moderators keep communities safe.',
      'We do not use your data for advertising, profiling or analytics, and we do not sell or share it with anyone.',
    ],
  },
  {
    heading: 'Who can see it',
    paragraphs: [
      'Posts in the global feed are visible to every signed-in member. Posts and channels inside a community are visible only to members of that community.',
      'Your username and avatar are visible to other members. Your email address is visible to members of communities you belong to, so that admins can manage members.',
      'If you block someone, their messages are hidden for you and they cannot see your messages, typing or read receipts.',
    ],
  },
  {
    heading: 'Where it is kept',
    paragraphs: [
      'Data is stored in a PostgreSQL database and uploaded images are stored on the server that runs PXL_LAB. Connections between your browser and the server are encrypted with HTTPS.',
      'Your browser keeps a sign-in token in local storage so you stay signed in. It expires after a short time. We do not use tracking cookies.',
      'The page loads its fonts from Google Fonts, so Google can see your IP address when the fonts download.',
    ],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'Your data stays while your account exists. Deleting a post, reply, channel or community removes its content. Leaving a community removes your membership.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You can change your username and email in Settings, upload or remove your avatar, edit or delete your own posts and replies, leave communities, and block or unblock people.',
      'To get a copy of your data or to have your account deleted, contact the PXL_LAB team through 42 Abu Dhabi. We will reply as soon as we can.',
    ],
  },
]

export const TERMS_OF_SERVICE: LegalSection[] = [
  {
    heading: 'Using PXL_LAB',
    paragraphs: [
      'PXL_LAB is a place for 42 students to learn, share and build together. By creating an account you agree to these terms.',
      'You are responsible for your account. Keep your password private and do not share your account with anyone.',
    ],
  },
  {
    heading: 'Be kind and share responsibly',
    paragraphs: [
      'Treat other members with respect. Harassment, hate speech, threats and spam are not allowed.',
      'Only post content you have the right to share. Do not post other people’s personal information, passwords or private messages.',
      'Images must be PNG, JPEG or WEBP and at most 5 MB. Do not upload unsafe or inappropriate images.',
    ],
  },
  {
    heading: 'Communities and moderation',
    paragraphs: [
      'Each community has an owner and may have admins and moderators. They can manage members, channels and reported content in that community.',
      'You can report posts and replies that break these rules. Moderators review reports and can remove members who break them. Owners must transfer ownership or delete the community before leaving it.',
    ],
  },
  {
    heading: 'Your content',
    paragraphs: [
      'You keep ownership of what you post. By posting, you allow PXL_LAB to store it and show it to the members who can see that feed, community or channel.',
      'You can edit or delete your own posts and replies at any time.',
    ],
  },
  {
    heading: 'Availability',
    paragraphs: [
      'PXL_LAB is a student project. It is provided as it is, without any guarantee that it will always be available or free of errors. Please keep your own copy of anything important.',
    ],
  },
  {
    heading: 'Ending your use',
    paragraphs: [
      'You can stop using PXL_LAB at any time. The team may remove accounts that break these terms.',
    ],
  },
  {
    heading: 'Changes',
    paragraphs: [
      'We may update these terms as the project changes. The date at the top of this page shows the latest version.',
    ],
  },
]
