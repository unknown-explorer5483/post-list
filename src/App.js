import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

const API_URL = 'https://jsonplaceholder.typicode.com';

function Post({ post, onClick }) {
    return (
        <div className="post" onClick={() => onClick(post)}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <p className="author">Author: {post.author}</p>
        </div>
    );
}

function FullScreenPost({ post, onClose }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden'; 

        return () => {
            document.body.style.overflow = 'auto'; 
        };
    }, []);

    return (
        <div className="full-screen-post">
            <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <p className="author">Author: {post.author}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

function ThemeSwitch({ toggleTheme }) {
    return (
        <div className="theme-switch" onClick={toggleTheme}>
            Toggle Theme
        </div>
    );
}

function PostList() {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [darkTheme, setDarkTheme] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const [postsResponse, usersResponse] = await Promise.all([
                    axios.get(`${API_URL}/posts`),
                    axios.get(`${API_URL}/users`)
                ]);

                const usersMap = new Map(usersResponse.data.map(user => [user.id, user.name]));

                const postsWithAuthors = postsResponse.data.map(post => ({
                    ...post,
                    author: usersMap.get(post.userId)
                }));

                setPosts(postsWithAuthors);
                setAuthors([...new Set(postsWithAuthors.map(post => post.author))]); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchPosts();
    }, []);

    const handlePostClick = post => {
        setSelectedPost(post);
    };

    const handleCloseFullScreen = () => {
        setSelectedPost(null);
    };

    const toggleTheme = () => {
        setDarkTheme(prevTheme => !prevTheme);
    };

    const handleAuthorChange = event => {
        setSelectedAuthor(event.target.value);
    };

    const filteredPosts = selectedAuthor
        ? posts.filter(post => post.author === selectedAuthor)
        : posts;

    return (
        <div className={`post-list ${darkTheme ? 'dark' : 'light'}`}>
            <ThemeSwitch toggleTheme={toggleTheme} />
            <div className="author-filter">
                <select value={selectedAuthor} onChange={handleAuthorChange}>
                    <option value="">All Authors</option>
                    {authors.map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
            </div>
            {filteredPosts.map(post => (
                <Post key={post.id} post={post} onClick={handlePostClick} />
            ))}
            {selectedPost && (
                <FullScreenPost post={selectedPost} onClose={handleCloseFullScreen} />
            )}
        </div>
    );
}

function App() {
    return (
        <div className="app">
            <h1>Post List</h1>
            <PostList />
        </div>
    );
}

export default App;
