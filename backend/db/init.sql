CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Admin',
    published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags VARCHAR(255)[], 
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO articles (title, content, author, is_published, tags)
VALUES
('My First Blog Post', 'This is the exciting content of my very first blog post about learning fullstack development!', 'Admin', TRUE, ARRAY['fullstack', 'learning', 'node']),
('Understanding REST APIs', 'RESTful APIs are a core concept in modern web development. They define how clients and servers communicate.', 'Admin', TRUE, ARRAY['api', 'rest', 'backend'])
ON CONFLICT (id) DO NOTHING; 