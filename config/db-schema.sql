CREATE DATABASE IF NOT EXISTS django CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE DATABASE IF NOT EXISTS fluidintegrates CHARACTER SET utf8 COLLATE utf8_general_ci;

USE fluidintegrates;

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username varchar(64) COLLATE utf8_general_ci DEFAULT NULL,
    registered tinyint(1) NOT NULL DEFAULT 0,
    last_name varchar(100) COLLATE utf8_general_ci DEFAULT NULL,
    first_name varchar(100) COLLATE utf8_general_ci DEFAULT NULL,
    email varchar(254) COLLATE utf8_general_ci NOT NULL,
    company varchar(254),
    role varchar(32) NOT NULL,
    last_login datetime(6) DEFAULT NULL,
    date_joined datetime(6) DEFAULT NULL,
    PRIMARY KEY (id, email)
) ENGINE=INNODB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE IF NOT EXISTS projects (
    id INT NOT NULL AUTO_INCREMENT,
    project varchar(64) COLLATE utf8_general_ci NOT NULL,
    description varchar(254) COLLATE utf8_general_ci NOT NULL,
    PRIMARY KEY (id)
) ENGINE=INNODB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE IF NOT EXISTS findings (
    project varchar(64) COLLATE utf8_general_ci NOT NULL,
    amount INT NOT NULL,
    PRIMARY KEY (project)
) ENGINE=INNODB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE IF NOT EXISTS project_access (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    has_access tinyint(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
