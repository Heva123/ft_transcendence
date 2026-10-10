import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell'
import ChannelPage from './pages/ChannelPage'
import CommunitiesPage from './pages/CommunitiesPage'
import CommunityPage from './pages/CommunityPage'
import FriendsPage from './pages/FriendsPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import PostPage from './pages/PostPage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:communityId" element={<CommunityPage />} />
        <Route path="/channels" element={<Navigate to="/channels/1" replace />} />
        <Route path="/channels/:channelId" element={<ChannelPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </AppShell>
  )
}

export default App