CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name CITEXT UNIQUE,
    avatar_url TEXT,
    onboarded BOOLEAN NOT NULL DEFAULT false,
    completed_tour BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT name_length CHECK (
        name IS NULL OR length(name) BETWEEN 3 AND 32
    ),
    CONSTRAINT username_allowed_chars CHECK (
        name IS NULL OR name ~* '^[a-z0-9._]*$'
    )
);

CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE album_member_role AS ENUM ('OWNER', 'MEMBER', 'VIEWER');

CREATE TABLE IF NOT EXISTS album_members (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    role album_member_role NOT NULL DEFAULT 'MEMBER',
    PRIMARY KEY (user_id, album_id)
);

CREATE TABLE IF NOT EXISTS album_image (
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (album_id, image_id)
);

CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
