const apiKey = "077144840fb69c5ca85facbfcf28551b";

const searchBtn = document.getElementById("searchBtn");
const recommendBtn = document.getElementById("recommendBtn");
const resultsDiv = document.getElementById("movieResults");
const genreSelect = document.getElementById("genreSelect");
const watchlistBtn = document.getElementById("watchlistBtn");

// Retrieve movie data from TMDB
async function fetchMovies(url, selectedGenre = "") {
    resultsDiv.textContent = "Loading movies...";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to retrieve movies.");
        }

        const data = await response.json();
        const movies = data.results || [];

        // Use JavaScript logic to filter recommended movies
        if (selectedGenre !== "") {
            const recommendedMovies = movies.filter(movie => {
                const matchesGenre =
                    movie.genre_ids.includes(Number(selectedGenre));

                const hasEnoughVotes = movie.vote_count >= 50;
                const hasGoodRating = movie.vote_average >= 6;

                return matchesGenre &&
                       hasEnoughVotes &&
                       hasGoodRating;
            });

            if (recommendedMovies.length === 0) {
                resultsDiv.textContent =
                    "No suitable movie recommendations found.";
                return;
            }

            displayMovies(recommendedMovies);
        } else {
            displayMovies(movies);
        }

    } catch (error) {
        resultsDiv.textContent = error.message;
    }
}

// Student-written movie recommendation logic
function getMovieRecommendation(movie) {
    const rating = Number(movie.vote_average) || 0;
    const votes = Number(movie.vote_count) || 0;

    if (votes < 50) {
        return "Not enough ratings to recommend confidently.";
    } else if (rating >= 8) {
        return "Highly Recommended";
    } else if (rating >= 7) {
        return "Recommended";
    } else if (rating >= 6) {
        return "Worth Considering";
    } else {
        return "Not a Top Recommendation";
    }
}

// Search movies by title
searchBtn.addEventListener("click", () => {
    const movieName = document
        .getElementById("movieInput").value.trim();

    if (movieName === "") {
        alert("Please enter a movie title.");
        return;
    }

    const url =
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movieName)}`;

    fetchMovies(url);
});

// Suggest movies based on selected genre
recommendBtn.addEventListener("click", () => {
    const genre = genreSelect.value;

    if (genre === "") {
        alert("Please select a genre.");
        return;
    }

    // Student-written control statement
    let genreMessage;

    switch (genre) {
        case "28":
            genreMessage = "Action Movies";
            break;
        case "35":
            genreMessage = "Comedy Movies";
            break;
        case "27":
            genreMessage = "Horror Movies";
            break;
        case "10749":
            genreMessage = "Romance Movies";
            break;
        case "878":
            genreMessage = "Science Fiction Movies";
            break;
        case "16":
            genreMessage = "Animation Movies";
            break;
        default:
            genreMessage = "Unknown Genre";
    }

    const url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre}&sort_by=popularity.desc`;

    fetchMovies(url, genre);
});

// Display movie information
function displayMovies(movies) {
    resultsDiv.innerHTML = "";

    if (movies.length === 0) {
        resultsDiv.textContent = "No movies found.";
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";

        // Movie title
        const title = document.createElement("h3");
        title.textContent = movie.title;

        // Movie poster
        const poster = document.createElement("img");

        if (movie.poster_path) {
            poster.src =
                `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
            poster.alt = movie.title;
        } else {
            poster.alt = "No poster available";
        }

        // Movie rating
        const rating = document.createElement("p");
        rating.textContent =
            `Rating: ${movie.vote_average}/10`;

        // Recommendation based on rating
        const recommendation = document.createElement("p");
        recommendation.className = "movie-suggestion";
        recommendation.textContent =
            getMovieRecommendation(movie);

        // Release date
        const release = document.createElement("p");
        release.textContent =
            `Release Date: ${movie.release_date || "Unknown"}`;

        // Movie description
        const description = document.createElement("p");
        description.textContent =
            movie.overview || "No description available.";

        // Add to Watchlist button
        const addBtn = document.createElement("button");
        addBtn.textContent = "♡ Add to Watchlist";

        addBtn.addEventListener("click", async () => {
            addBtn.disabled = true;
            addBtn.textContent = "Adding...";

            try {
                // Retrieve actual movie duration from TMDB
                const url =
                    `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "Unable to retrieve movie details."
                    );
                }

                const details = await response.json();

                // Check movie duration
                if (!Number.isInteger(details.runtime) ||
                    details.runtime <= 0) {
                    throw new Error(
                        "Movie duration is unavailable."
                    );
                }

                // Retrieve existing watchlist
                const watchlist = JSON.parse(
                    localStorage.getItem("mscMovies") || "[]"
                );

                // Prevent duplicate movies
                const exists = watchlist.some(
                    saved => saved.id === details.id
                );

                if (exists) {
                    alert(
                        "This movie is already in your watchlist!"
                    );
                    return;
                }

                // Create movie object with recommendation
                const selectedMovie = {
                    id: details.id,
                    title: details.title,
                    duration: details.runtime,
                    poster: details.poster_path,
                    status: "Plan to Watch",
                    recommendation: getMovieRecommendation(details)
                };

                // Save movie
                watchlist.push(selectedMovie);

                localStorage.setItem(
                    "mscMovies",
                    JSON.stringify(watchlist)
                );

                alert(
                    `${details.title} added to your watchlist!`
                );

            } catch (error) {
                alert(error.message);
            } finally {
                addBtn.disabled = false;
                addBtn.textContent = "♡ Add to Watchlist";
            }
        });

        // Display movie card
        movieCard.append(
            poster,
            title,
            rating,
            recommendation,
            release,
            description,
            addBtn
        );

        resultsDiv.appendChild(movieCard);
    });
}

// Open Watchlist in a separate Electron window
watchlistBtn.addEventListener("click", () => {
    window.electronAPI.openWatchlist();
});
