DROP SCHEMA IF EXISTS kwicker CASCADE;

CREATE SCHEMA kwicker;
SET TIMEZONE = 'Europe/Brussels';

CREATE TABLE kwicker.users
(
    id_user       SERIAL PRIMARY KEY,
    forename      VARCHAR(50)  NOT NULL CHECK (forename <> ''),
    lastname      VARCHAR(50)  NOT NULL CHECK (lastname <> ''),
    email         VARCHAR(100) NOT NULL CHECK (email <> '') UNIQUE,
    username      VARCHAR(100) NOT NULL CHECK (username <> '') UNIQUE,
    image         BYTEA        NULL CHECK (image <> ''),
    password      VARCHAR(60)  NOT NULL CHECK (password <> ''),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_admin      BOOLEAN      NOT NULL DEFAULT FALSE,
    biography     VARCHAR(500) NULL,
    date_creation TIMESTAMP    NOT NULL DEFAULT NOW()
--     date_creation DATE    NOT NULL DEFAULT NOW()
);

CREATE TABLE kwicker.posts
(
    id_post         SERIAL PRIMARY KEY,
    id_user         INTEGER      NOT NULL,
    image           VARCHAR(300) CHECK (image <> '' OR image IS NULL),
    message         VARCHAR(300) NOT NULL CHECK (message <> ''),
    parent_post     INTEGER,
    is_removed      BOOLEAN      NOT NULL DEFAULT FALSE,
    date_creation   TIMESTAMP    NOT NULL DEFAULT NOW(),
--     date_creation   TIMESTAMP    NOT NULL DEFAULT NOW(),
--     hour_creation TIME NOT NULL DEFAULT now(),
    number_of_likes INT          NOT NULL DEFAULT 0 CHECK (number_of_likes >= 0),
    FOREIGN KEY (id_user) REFERENCES kwicker.users (id_user),
    FOREIGN KEY (parent_post) REFERENCES kwicker.posts (id_post)
);

CREATE TABLE kwicker.follows
(
    id_user_followed INTEGER REFERENCES kwicker.users (id_user) NOT NULL,
    id_user_follower INTEGER REFERENCES kwicker.users (id_user) NOT NULL,
    PRIMARY KEY (id_user_followed, id_user_follower)
);

CREATE TABLE kwicker.likes
(
    id_user INTEGER REFERENCES kwicker.users (id_user) NOT NULL,
    id_post INTEGER REFERENCES kwicker.posts (id_post) NOT NULL,
    PRIMARY KEY (id_user, id_post)
);

CREATE TABLE kwicker.reports
(
    id_post INTEGER,
    id_user INTEGER,
    message VARCHAR(300) NOT NULL CHECK ( message <> '' ),
    PRIMARY KEY (id_post, id_user),
    FOREIGN KEY (id_user) REFERENCES kwicker.users (id_user),
    FOREIGN KEY (id_post) REFERENCES kwicker.posts (id_post)

);

CREATE TABLE kwicker.messages
(
    id_message         SERIAL PRIMARY KEY,
    id_sender          INTEGER NOT NULL CHECK ( id_sender <> id_recipient ),
    id_recipient       INTEGER NOT NULL,
    message            TEXT NOT NULL CHECK ( message <> '' ),
    date_creation      TIMESTAMP    NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_sender) REFERENCES kwicker.users (id_user),
    FOREIGN KEY (id_recipient) REFERENCES kwicker.users (id_user)
);

CREATE OR REPLACE FUNCTION kwicker.add_like() RETURNS TRIGGER AS
$$
BEGIN
    UPDATE kwicker.posts
    SET number_of_likes = number_of_likes + 1
    WHERE id_post = NEW.id_post;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_like
    AFTER INSERT
    ON kwicker.likes
    FOR EACH ROW
EXECUTE PROCEDURE kwicker.add_like();

CREATE OR REPLACE FUNCTION kwicker.delete_like() RETURNS TRIGGER AS
$$
BEGIN
    UPDATE kwicker.posts
    SET number_of_likes = number_of_likes - 1
    WHERE id_post = OLD.id_post;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_like
    AFTER DELETE
    ON kwicker.likes
    FOR EACH ROW
EXECUTE PROCEDURE kwicker.delete_like();