Create table Users(
	user_id int Primary Key auto_increment,
	steam_id bigint Not Null,
	points int default 0, 
	created_at datetime
);

create table Games(
	app_id int Primary key, 
    title text,
    avg_playtime int,
    steam_rating double,
    hltb_playtime int null
);

create table UserLibrary(
	user_id int not null,
    app_id int not null,
	primary key (user_id, app_id),
    playtime_mins int, 
    last_played datetime,
    status ENUM('backlog', 'playing', 'completed'),
    Foreign key(user_id) references Users(user_id),
    Foreign key(app_id) references Games(app_id)
);

create table UserReviews(
	user_id int not null,
    app_id int not null,
	primary key (user_id, app_id),
    rating double,
    review_text text,
    foreign key(user_id) references Users(user_id),
    foreign key(app_id) references Games(app_id)
);

create table Badges(
	badge_id int primary key auto_increment,
    badge_name varchar(255),
    badge_description varchar(255),
    threshold_type varchar(255),
    threshold_value int
);

create table UserBadges(
	user_id int not null,
    badge_id int not null,
	primary key(user_id, badge_id),
    earned_at datetime,
    foreign key(user_id) references Users(user_id),
    foreign key(badge_id) references Badges(badge_id)
);

CREATE TABLE Genres (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    genre_name VARCHAR(255) NOT NULL
);

CREATE TABLE GameGenres (
    game_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id) REFERENCES Games(app_id),
    FOREIGN KEY (genre_id) REFERENCES Genres(genre_id)
);